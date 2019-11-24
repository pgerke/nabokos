import { Coordinate } from './coordinate';
import { Tile } from './tile';

export class Level {
  tiles: Tile[][];
  cursor: Coordinate;
  name: string;
  serialized: string;
  setName: string;
  shortSetName: string;
  id: number;
}
