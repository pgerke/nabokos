import { Injectable } from '@angular/core';
import { Level } from '../models/level';
import { Tile } from '../models/tile';
import { Coordinate } from '../models/coordinate';
import { levels as levelData } from '../levels';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LevelService {
  private levels: Level[] = [];
  private index = 0;

  constructor(private router: Router) {
    this.loadLevels();
    console.log(`Loaded ${this.getLevelCount()} levels.`);
  }

  getLevel(index: number): Level | undefined {
    if (index < 0 || index >= this.getLevelCount()) {
      return undefined;
    }

    this.index = index;
    // console.log(this.levels[this.index].serialized);
    // console.log(this.levels[this.index].tiles);
    return this.levels[this.index];
  }

  getLevelCount(): number {
    return this.levels.length;
  }

  getNextLevel(): void {
    this.router.navigate(['level', this.index === this.getLevelCount() - 1 ? 0 : this.index + 1]);
  }

  getPreviousLevel(): void {
    this.router.navigate(['level', (!this.index ? this.getLevelCount() : this.index) - 1]);
  }

  loadLevel(serializedLevel: string, name: string): Level {
    const level = new Level();
    level.name = name;
    level.tiles = [];
    level.serialized = serializedLevel;
    const lines = serializedLevel.split('\n');
    let lineNumber = 0;
    let colNumber = 0;
    lines.forEach(line => {
      colNumber = 0;
      const tiles: Tile[] = [];
      for (const c of line) {
        switch (c) {
          case '#':
            tiles.push(Tile.wall);
            break;
          case '*':
            tiles.push(Tile.targetWithBox);
            break;
          case ' ':
            tiles.push(Tile.floor);
            break;
          case '.':
            tiles.push(Tile.target);
            break;
          case '$':
            tiles.push(Tile.box);
            break;
          case '@':
            tiles.push(Tile.floor);
            level.cursor = new Coordinate(colNumber, lineNumber);
            break;
          case '+':
            tiles.push(Tile.target);
            level.cursor = new Coordinate(colNumber, lineNumber);
            break;
          default:
            continue;
        }
        colNumber++;
      }
      level.tiles.push(tiles);
      lineNumber++;
    });
    return level;
  }

  private loadLevels() {
    const separateLevels = levelData.split('\n\n');
    separateLevels.forEach((serializedLevel: string, index: number) => {
      const level = this.loadLevel(serializedLevel, 'Level ' + (index + 1));
      this.levels.push(level);
    });
  }
}
