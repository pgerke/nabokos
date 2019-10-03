import { Component, OnInit, HostListener } from '@angular/core';
import { LevelService } from './services/level.service';
import { Coordinate } from './models/coordinate';
import { Direction } from './models/direction';
import { Tile } from './models/tile';
import { Level } from './models/level';
import * as _ from 'lodash';
import { PathFinderService } from './services/pathFinder.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private readonly historyLimit = 1000;
  private internalLevel: Level;

  isWin: boolean;
  title = 'nabokos';
  totalMoves: number;
  history: Level[] = [];
  counter: number;
  level: Level;
  isWalking: boolean;

  constructor(
    public levelService: LevelService,
    public pathFinderService: PathFinderService
    ) {}

  ngOnInit() {
    this.internalLevel = this.levelService.getCurrentLevel();
    this.reset();
  }


  checkWin() {
    this.isWin = this.level.tiles.every(line => !line.some(tile => tile === Tile.target || tile === Tile.box));
    if (this.isWin) {
      console.log('Player has won.');
    }
  }

  isCursorHere(x: number, y: number): boolean {
    return x === this.level.cursor.x && y === this.level.cursor.y;
  }

  isFreeTile(coordinate: Coordinate): boolean {
    const tile = this.level.tiles[coordinate.y][coordinate.x];
    return tile === Tile.floor || tile === Tile.target;
  }

  getNextCoordinate(coordinate: Coordinate, direction: Direction): Coordinate {
    const next = new Coordinate(coordinate.x, coordinate.y);
    switch (direction) {
      case Direction.Up:
        next.y--;
        break;
      case Direction.Right:
        next.x++;
        break;
      case Direction.Down:
        next.y++;
        break;
      case Direction.Left:
        next.x--;
        break;
    }
    return next;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    let direction;
    switch (event.key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        direction = Direction.Up;
        break;
      case 's':
      case 'S':
      case 'ArrowDown':
        direction = Direction.Down;
        break;
      case 'a':
      case 'A':
      case 'ArrowLeft':
        direction = Direction.Left;
        break;
      case 'd':
      case 'D':
      case 'ArrowRight':
        direction = Direction.Right;
        break;
      case 'z':
      case 'Z':
      case 'Backspace':
        this.undo();
        return;
      default: return;
    }
    this.run(direction);
  }

  moveCursor(coordinate: Coordinate): boolean {
    if (!this.isFreeTile(coordinate)) {
      return false;
    }

    this.level.cursor = coordinate;
    this.counter++;
    return true;
  }

  next() {
    this.internalLevel = this.levelService.getNextLevel();
    this.reset();
  }

  previous() {
    this.internalLevel = this.levelService.getPreviousLevel();
    this.reset();
  }

  pushBox(coordinate: Coordinate, direction: Direction): boolean {
    const tile = this.level.tiles[coordinate.y][coordinate.x];
    if (tile !== Tile.box && tile !== Tile.targetWithBox) {
      return false;
    }

    const newBoxCoordinate = this.getNextCoordinate(coordinate, direction);
    if (!this.isFreeTile(newBoxCoordinate)) {
      return false;
    }

    if (this.level.tiles[coordinate.y][coordinate.x] === Tile.box) {
      this.level.tiles[coordinate.y][coordinate.x] = Tile.floor;
    } else {
      this.level.tiles[coordinate.y][coordinate.x] = Tile.target;
    }
    if (this.level.tiles[newBoxCoordinate.y][newBoxCoordinate.x] === Tile.target) {
      this.level.tiles[newBoxCoordinate.y][newBoxCoordinate.x] = Tile.targetWithBox;
    } else {
      this.level.tiles[newBoxCoordinate.y][newBoxCoordinate.x] = Tile.box;
    }
    this.moveCursor(coordinate);
    return true;
  }

  run(direction: Direction) {
    const newCoordinate: Coordinate = this.getNextCoordinate(this.level.cursor, direction);
    const levelCopy = _.cloneDeep(this.level);

    if (this.moveCursor(newCoordinate) || this.pushBox(newCoordinate, direction)) {
      this.saveHistory(levelCopy);
      this.checkWin();
    }
  }

  reset() {
    this.level = _.cloneDeep(this.internalLevel);
    this.history = [];
    this.counter = 0;
    this.isWin = false;
  }

  saveHistory(level: Level) {
    if (this.history.push(level) > this.historyLimit) {
      this.history.shift();
    }
  }

  undo() {
    if (!this.history.length) {
      return;
    }

    this.level = this.history.pop();
    this.counter++;
  }

  /**
   * Function providing navigation through touch and mouse clicks.
   * @param tile kind of the clicked element
   * @param x x coordinate of the clicked element
   * @param y y coordinate of the clicked element
   */
  async moveToClick(tile: string, x: number, y: number) {
    // Doesn't do anything if the clicked element is a wall, or the cursor is already moving.
    if (tile === Tile.wall || this.isWalking) {
      return;
    }

    // Checks if the clicked element is a box and the cursor is standing next to it, in that case, the box should be moved (with the cursor).
    if (tile === Tile.box || tile === Tile.targetWithBox) {
      const direction = this.getBoxMoveDirection(new Coordinate(x, y));
      if (direction) {
        this.run(direction);
        return;
      }
    }

    // Gets the array of coordinates, which is the path from the cursor to the clicked ndoe.
    let path = this.pathFinderService.findPath(new Coordinate(x, y), this.level.cursor, this.level);

    if (path.length) {
      this.isWalking = true;
      
      // Moves the cursor step by step with a delay inbetween of 200 milliseconds.
      // The history gets saved after every move, so the undo funcionality can work properly (undoing only one step with one click).
      for (let item of path) {
        const levelCopy = _.cloneDeep(this.level);
        if (this.moveCursor(item)) {
          this.saveHistory(levelCopy);
          await this.delay(200);
        }
      }
  
      this.checkWin();
      this.isWalking = false;
    }
  }

  /**
   * Provides possiblity to wait for a given number of milliseconds.
   * @param ms number of milliseconds to wait for
   */
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  /**
   * Checks if the cursor is standing next to the given node (box) and according to where the cursor stands, returns the direction.
   */
  getBoxMoveDirection(box: Coordinate) {
    if (this.level.cursor.isEqual(new Coordinate(box.x, box.y - 1))) {
      return Direction.Down;
    } else if (this.level.cursor.isEqual(new Coordinate(box.x + 1, box.y))) {
      return Direction.Left;
    } else if (this.level.cursor.isEqual(new Coordinate(box.x, box.y + 1))) {
      return Direction.Up;
    } else if (this.level.cursor.isEqual(new Coordinate(box.x - 1, box.y))) {
      return Direction.Right;
    }
    return null;
  }

}
