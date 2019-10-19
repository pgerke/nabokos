import { Level } from './../models/level';

export class Savegame {
  levelId: number;
  levelTime: number;
  level: Level;
  moves: number;
  history: Level[];
  isWin: boolean;
}
