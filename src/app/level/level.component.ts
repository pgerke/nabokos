import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Level, Coordinate, Tile, Direction, Savegame } from '../models';
import { LevelService, HighscoreService, PathFinderService } from '../services';
import { Subscription, interval } from 'rxjs';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent implements OnInit, OnDestroy {
  private readonly allowMultipleQuickSaves = false;
  private readonly historyLimit = 1000;
  private internalLevel: Level;

  isWin: boolean;
  hasQuicksave: boolean;
  levelId: number;
  levelTime: number;
  levelStarted: boolean;
  history: Level[] = [];
  counter: number;
  level: Level;
  routeParameterSubscription: Subscription;
  levelTimerSubscription: Subscription;
  pathToWalkOn: Coordinate[];
  contentWidth: number;
  windowWidth: number;
  centerContent: boolean;
  hasHighscoreEntry: boolean;
  scaleValue = 100;

  constructor(
    private levelService: LevelService,
    private highscoreService: HighscoreService,
    private router: Router,
    private route: ActivatedRoute,
    private pathFinderService: PathFinderService
  ) { }

  ngOnInit() {
    this.routeParameterSubscription = this.route.paramMap.subscribe(value => {
      this.levelId = Number.parseInt(value.get('level'), 10);
      const isNewGame = value.get('newGame') ? value.get('newGame').toLowerCase() === 'true' : true;
      console.log('Level: ' + this.levelId);
      this.internalLevel = this.levelService.getLevel(this.levelId ? this.levelId : 0);
      if (isNewGame || !this.loadSaveGame()) {
        this.reset();
      }

      const saveGameSerialized = localStorage.getItem(this.getQuickSaveName());
      this.hasQuicksave = saveGameSerialized && (JSON.parse(saveGameSerialized) as Savegame).levelId === this.levelId;
      this.setContentWidth();
    });
    this.levelTimerSubscription = interval(1000).subscribe(() => {
      if (this.levelStarted && !this.isWin) {
        this.levelTime += 1000;
      }
    });
    window.addEventListener('touchstart', this.preventDefaultZoomEvent.bind(this), { passive: false });
  }

  ngOnDestroy() {
    this.levelTimerSubscription.unsubscribe();
    this.levelTimerSubscription = null;
    this.routeParameterSubscription.unsubscribe();
    this.routeParameterSubscription = null;
  }

  checkWin() {
    this.isWin = this.level.tiles.every(line => !line.some(tile => tile === Tile.target || tile === Tile.box));
    if (this.isWin && !this.hasHighscoreEntry) {
      console.log('Player has won.');
      this.highscoreService.addEntry(this.levelId, {
        name: 'Player',
        moves: this.counter,
        levelTime: this.levelTime
      });
      this.hasHighscoreEntry = true;
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

  private getQuickSaveName(): string {
      return this.allowMultipleQuickSaves ? 'quicksave' + this.levelId : 'quicksave';
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

  createSaveGame(): Savegame {
    return {
      levelId: this.levelId,
      levelTime: this.levelTime,
      level: this.level,
      history: this.history,
      moves: this.counter,
      isWin: this.isWin
    };
  }

  loadSaveGame(): boolean {
    const saveGameSerialized = localStorage.getItem('savegame');
    if (!saveGameSerialized) {
      return false;
    }

    const saveGame = JSON.parse(saveGameSerialized) as Savegame;
    if (saveGame.levelId !== this.levelId) {
      return false;
    }

    this.loadSaveGameInternal(saveGame);
    return true;
  }

  private loadSaveGameInternal(saveGame: Savegame) {
    this.level = saveGame.level;
    this.history = saveGame.history;
    this.levelTime = saveGame.levelTime;
    this.counter = saveGame.moves;
    this.levelStarted = false;
    this.isWin = saveGame.isWin;
    this.hasHighscoreEntry = this.isWin;
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
    this.router.navigate(['level', this.levelService.getNextLevel(), true]);
  }

  previous() {
    this.router.navigate(['level', this.levelService.getPreviousLevel(), true]);
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

  quickLoad(): boolean {
    const saveGameSerialized = localStorage.getItem(this.getQuickSaveName());
    if (!saveGameSerialized) {
      return false;
    }

    const saveGame = JSON.parse(saveGameSerialized) as Savegame;
    if (saveGame.levelId !== this.levelId) {
      return false;
    }

    this.loadSaveGameInternal(saveGame);
    return true;
  }

  quickSave() {
    const saveGame: Savegame = this.createSaveGame();
    localStorage.setItem(this.getQuickSaveName(), JSON.stringify(saveGame));
    this.hasQuicksave = true;
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

  reset() {
    this.pathToWalkOn = [];
    this.level = _.cloneDeep(this.internalLevel);
    this.history = [];
    this.counter = 0;
    this.levelTime = 0;
    this.levelStarted = false;
    this.isWin = false;
  }

  saveHistory(level: Level) {
    if (this.history.push(level) > this.historyLimit) {
      this.history.shift();
    }
  }

  showMenu(): void {
    const saveGame: Savegame = this.createSaveGame();
    localStorage.setItem('savegame', JSON.stringify(saveGame));
    this.router.navigate(['menu']);
  }

  undo() {
    if (!this.history.length) {
      return;
    }

    this.pathToWalkOn = [];
    this.level = this.history.pop();
    this.counter++;
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

  /**
   * Calculates the width of the current level.
   */
  setContentWidth(): void {
    let countTiles = 0;
    // Necessary because not every row has the same count of columns.
    for (const i of this.level.tiles) {
      if (i.length > countTiles) {
        countTiles = i.length;
      }
    }
    // A tile is always drawn with 50px each.
    this.contentWidth = countTiles * (50 * this.scaleValue / 100);
    this.setContentAlignment();
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

    this.setContentWidth();
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
