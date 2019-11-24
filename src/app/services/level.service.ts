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
  private setCounter = {};
  private levels: Level[] = [];
  private levelSetName: string;
  private levelShortSetName: string;
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

  getLevels(setName: string): Level[] {
    return this.levels.filter(e => e.setName === setName);
  }

  getLevelCount(): number {
    return this.levels.length;
  }

  getLevelSets(): string[] {
    return [...new Set(this.levels.map(e => e.setName))];
  }

  getNextLevel(): void {
    this.router.navigate(['level', this.index === this.getLevelCount() - 1 ? 0 : this.index + 1, true]);
  }

  getPreviousLevel(): void {
    this.router.navigate(['level', (!this.index ? this.getLevelCount() : this.index) - 1, true]);
  }

  loadLevel(serializedLevel: string): Level {
    const level = new Level();
    level.setName = this.levelSetName;
    level.shortSetName = this.levelShortSetName;
    level.tiles = [];
    level.serialized = serializedLevel;
    const lines = serializedLevel.split('\n');
    let lineNumber = 0;
    let colNumber = 0;
    lines.forEach((line, index) => {
      if (index === 0 && line.match(/^\w+/)) {
        this.levelSetName = line;
        level.setName = line;
        this.levelShortSetName = lines[1];
        level.shortSetName = lines[1];
        this.setCounter[line] = 0;
        return;
      }

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
    level.name = (++this.setCounter[this.levelSetName]).toString();
    return level;
  }

  private loadLevels() {
    const separateLevels = levelData.split('\n\n');
    separateLevels.forEach((serializedLevel: string, index: number) => {
      const level = this.loadLevel(serializedLevel);
      level.id = index;
      this.levels.push(level);
    });
  }
}
