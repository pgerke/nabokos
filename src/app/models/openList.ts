import { Coordinate } from './coordinate';

// Open list for path finding has three columns in a row
// 0: calculated value which depends on distance to the target and steps away from the start
// 1: coordinates of the node
// 2: coordinates of the previous node
export interface OpenList extends Array<[number, Coordinate, Coordinate]>{}