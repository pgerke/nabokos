import { Component, HostListener, OnInit } from '@angular/core';
import { Level, Coordinate, Savegame, Tile, Direction } from '../models';
import * as _ from 'lodash';
import { PathFinderService, LevelService } from '../services';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {
  private internalLevel: Level;
  private readonly historyLimit = 1000;

  level: Level;
  scaleValue = 100;
  contentWidth = 6 * (50 * this.scaleValue / 100);
  windowWidth: number;
  centerContent: boolean;
  pathToWalkOn: Coordinate[];
  levelTime: number;
  levelStarted: boolean;
  history: Level[] = [];
  counter: number;
  isWin: boolean;
  hasQuicksave: boolean;
  levelTimerSubscription: Subscription;

  constructor(
    private pathFinderService: PathFinderService,
    private levelService: LevelService
  ) { }

  ngOnInit() {
    this.internalLevel = this.levelService.loadLevel(
`########
#      #
# @$ . #
#      #
########`);
    this.reset();
    const saveGameSerialized = localStorage.getItem('quicksave_tutorial');
    this.hasQuicksave = saveGameSerialized !== undefined;

    this.levelTimerSubscription = interval(1000).subscribe(() => {
      if (this.levelStarted && !this.isWin) {
        this.levelTime += 1000;
      }
    });
    this.setContentAlignment();
    window.addEventListener('touchstart', this.preventDefaultZoomEvent.bind(this), { passive: false });
  }

  reset() {
    this.pathToWalkOn = [];
    this.level = _.cloneDeep(this.internalLevel);
    this.history = [];
    this.counter = 0;
    this.levelTime = 0;
    this.levelStarted = false;
    this.isWin = false;
  }

  undo() {
    if (!this.history.length) {
      return;
    }

    this.pathToWalkOn = [];
    this.level = this.history.pop();
    this.counter++;
  }

  quickLoad(): void {
    const saveGameSerialized = localStorage.getItem('quicksave_tutorial');
    if (!saveGameSerialized) {
      return;
    }

    const saveGame = JSON.parse(saveGameSerialized) as Savegame;
    this.level = saveGame.level;
    this.history = saveGame.history;
    this.levelTime = saveGame.levelTime;
    this.counter = saveGame.moves;
    this.levelStarted = false;
    this.isWin = saveGame.isWin;
  }

  quickSave() {
    const saveGame: Savegame = {
      levelId: 0,
      levelTime: this.levelTime,
      level: this.level,
      history: this.history,
      moves: this.counter,
      isWin: this.isWin
    };
    localStorage.setItem('quicksave_tutorial', JSON.stringify(saveGame));
    this.hasQuicksave = true;
  }

  isCursorHere(x: number, y: number): boolean {
    return x === this.level.cursor.x && y === this.level.cursor.y;
  }

  run(direction: Direction) {
    const newCoordinate: Coordinate = this.getNextCoordinate(this.level.cursor, direction);
    const levelCopy = _.cloneDeep(this.level);

    if (this.moveCursor(newCoordinate) || this.pushBox(newCoordinate, direction)) {
      this.levelStarted = true;
      this.saveHistory(levelCopy);
      this.checkWin();
    }
  }

  isFreeTile(coordinate: Coordinate): boolean {
    const tile = this.level.tiles[coordinate.y][coordinate.x];
    return tile === Tile.floor || tile === Tile.target;
  }

  moveCursor(coordinate: Coordinate): boolean {
    if (!this.isFreeTile(coordinate)) {
      return false;
    }

    this.level.cursor = coordinate;
    this.counter++;
    return true;
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

  saveHistory(level: Level) {
    if (this.history.push(level) > this.historyLimit) {
      this.history.shift();
    }
  }

  checkWin() {
    this.isWin = this.level.tiles.every(line => !line.some(tile => tile === Tile.target || tile === Tile.box));
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

    /**
   * Function providing navigation through touch and mouse clicks.
   * @param tile kind of the clicked element
   * @param x x coordinate of the clicked element
   * @param y y coordinate of the clicked element
   */
  moveToClick(tile: string, x: number, y: number) {
    // Doesn't do anything if the clicked element is a wall.
    if (tile === Tile.wall) {
      return;
    }

    // tslint:disable-next-line: max-line-length
    // Checks if the clicked element is a box and the cursor is standing next to it, in that case, the box should be moved (with the cursor).
    if (tile === Tile.box || tile === Tile.targetWithBox) {
      const direction = this.getBoxMoveDirection(new Coordinate(x, y));
      if (direction) {
        this.run(direction);
        return;
      }
    }

    // Gets the array of coordinates, which is the path from the cursor to the clicked ndoe.
    this.pathToWalkOn = this.pathFinderService.findPath(new Coordinate(x, y), this.level.cursor, this.level);
    this.walkAlongPath(this.pathToWalkOn);
  }

  async walkAlongPath(path: Coordinate[]): Promise<void> {
    if (path.length) {
      // Moves the cursor step by step with a delay inbetween of 200 milliseconds.
      // The history gets saved after every move, so the undo funcionality can work properly (undoing only one step with one click).
      for (const item of path) {
        // if user clicked again
        if (this.pathToWalkOn !== path) {
          return;
        }

        const levelCopy = _.cloneDeep(this.level);
        this.moveCursor(item);
        this.levelStarted = true;
        this.saveHistory(levelCopy);
        await this.delay(200);
      }

      this.checkWin();
    }
  }

  /**
   * Provides possiblity to wait for a given number of milliseconds.
   * @param ms number of milliseconds to wait for
   */
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      case 'i':
      case 'I':
      case '+':
        this.onPinch('IN', 10);
        return;
      case 'o':
      case 'O':
      case '-':
        this.onPinch('OUT', 10);
        return;
      default:
        return;
    }
    this.run(direction);
  }

  /**
   * Whenever the window is resized, or another level is loaded, the function checks if the current window width is bigger than
   * the width needed for the level. When the window is smaller, the content needs to be aligned on the left side for correct scrolling.
   * @param event resizing event
   */
  @HostListener('window:resize', ['$event'])
  setContentAlignment(event?): void {
    this.windowWidth = window.innerWidth;
    this.centerContent = window.innerWidth > this.contentWidth;
  }

  /**
   * When a pinch is performed, the function checks the type of the pinch and increases or reduces the scale of the level.
   * The scale cannot be zero or less. After the new scale is set, the width of the content is recalculated.
   * @param zoomType indicates whether the user is trying to zoom 'IN' or 'OUT'
   * @param step indicates how much is added to the current scale
   */
  onPinch(zoomType: string, step = 1) {
    if (zoomType === 'IN') {
      this.scaleValue += step;
    } else if (this.scaleValue > step) {
      this.scaleValue -= step;
    }

    this.setContentAlignment();
  }

  /**
   * When zooming, no other touch action should be performed. This is needed for Safari, which allows scrolling while zooming.
   * Depending on how many fingers are touching the screen (only zoom needs two fingers), the default action is performed or not.
   * @param event the touch event
   */
  preventDefaultZoomEvent(event: any) {
    if (event.touches.length < 2) {
      return;
    }
    event.preventDefault();
  }
}