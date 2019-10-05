import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Level } from '../models/level';
import { Subscription, interval } from 'rxjs';
import { LevelService } from '../level.service';
import { Coordinate } from '../models/coordinate';
import { Tile } from '../models/tile';
import { Direction } from '../models/direction';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { HighscoreService } from '../highscore.service';
import { Savegame } from '../models/savegame';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent implements OnInit, OnDestroy {
  private readonly historyLimit = 1000;
  private internalLevel: Level;

  isWin: boolean;
  levelId: number;
  levelTime: number;
  levelStarted: boolean;
  history: Level[] = [];
  counter: number;
  level: Level;
  routeParameterSubscription: Subscription;
  levelTimerSubscription: Subscription;

  constructor(private levelService: LevelService,
              private highscoreService: HighscoreService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.routeParameterSubscription = this.route.paramMap.subscribe(value => {
      this.levelId =  Number.parseInt(value.get('level'), 10);
      console.log('Level: ' + this.levelId);
      this.internalLevel = this.levelService.getLevel(this.levelId ? this.levelId : 0);
      if (!this.loadSaveGame()) {
        this.reset();
      }
    });
    this.levelTimerSubscription = interval(1000).subscribe(() => {
      if (this.levelStarted && !this.isWin) {
        this.levelTime += 1000;
      }
    });
  }

  ngOnDestroy() {
    this.levelTimerSubscription.unsubscribe();
    this.levelTimerSubscription = null;
    this.routeParameterSubscription.unsubscribe();
    this.routeParameterSubscription = null;
  }

  checkWin() {
    this.isWin = this.level.tiles.every(line => !line.some(tile => tile === Tile.target || tile === Tile.box));
    if (this.isWin) {
      console.log('Player has won.');
      this.highscoreService.addEntry(this.levelId, {
        name: 'Player', moves: this.counter, levelTime: this.levelTime
      });
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
  createSaveGame(): void {
    const saveGame: Savegame = {
      levelId: this.levelId,
      levelTime: this.levelTime,
      level: this.level,
      history: this.history,
      moves: this.counter
    };

    localStorage.setItem('savegame', JSON.stringify(saveGame));
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

    this.level = saveGame.level;
    this.history = saveGame.history;
    this.levelTime = saveGame.levelTime;
    this.counter = saveGame.moves;
    this.levelStarted = false;
    return true;
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
    this.levelService.getNextLevel();
  }

  previous() {
    this.levelService.getPreviousLevel();
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
      this.levelStarted = true;
      this.saveHistory(levelCopy);
      this.checkWin();
    }
  }

  reset() {
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
    this.createSaveGame();
    this.router.navigate(['menu']);
  }

  undo() {
    if (!this.history.length) {
      return;
    }

    this.level = this.history.pop();
    this.counter++;
  }
}
