import { Injectable } from '@angular/core';
import { Level } from './models/level';
import { Tile } from './models/tile';
import { Coordinate } from './models/coordinate';
import { levels as levelData } from './levels';

@Injectable({
  providedIn: 'root'
})
export class LevelService {

  private levels: Level[] = [];
  private index = 0;

  constructor() {
    this.loadLevels();
    console.log(`Loaded ${this.getLevelCount()} levels.`);
  }

  getCurrentLevel(): Level {
    // console.log(this.levels[this.index].serialized);
    // console.log(this.levels[this.index].tiles);
    return this.levels[this.index];
  }

  getLevelCount(): number {
    return this.levels.length;
  }

  getNextLevel(): Level {
    this.index = (this.index === this.getLevelCount() - 1) ? 0 : this.index + 1;
    return this.getCurrentLevel();
  }

  getPreviousLevel(): Level {
    this.index = ((!this.index) ? this.getLevelCount() : this.index) - 1;
    return this.getCurrentLevel();
  }

  private loadLevels() {
    let lineNumber = 0;
    const separateLevels = levelData.split('\n\n');
    separateLevels.forEach((serializedLevel: string, index: number) => {
      const level = new Level();
      level.name = 'Level ' + (index + 1);
      level.tiles = [];
      level.serialized = serializedLevel;
      const lines = serializedLevel.split('\n');
      lineNumber = 0;
      let colNumber = 0;
      lines.forEach(line => {
        colNumber = 0;
        const tiles: Tile[] = [];
        for (const c of line) {
          switch (c) {
            case '#': tiles.push(Tile.wall); break;
            case '*': tiles.push(Tile.targetWithBox); break;
            case ' ': tiles.push(Tile.floor); break;
            case '.': tiles.push(Tile.target); break;
            case '$': tiles.push(Tile.box); break;
            case '@':
              tiles.push(Tile.floor);
              level.cursor = new Coordinate(colNumber, lineNumber);
              break;
            default: continue;
          }
          colNumber++;
        }
        level.tiles.push(tiles);
        lineNumber++;
      });
      this.levels.push(level);
    });
  }
}
