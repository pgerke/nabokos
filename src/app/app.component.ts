import { Component, OnInit, HostListener } from '@angular/core';
import { LevelService } from './level.service';
import { Coordinate } from './models/coordinate';
import { Direction } from './models/direction';
import { Tile } from './models/tile';
import { Level } from './models/level';
import * as _ from 'lodash';

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

  constructor(public levelService: LevelService) {}

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
    const next = {...coordinate};
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
}
