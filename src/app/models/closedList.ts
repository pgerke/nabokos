import { Coordinate } from './coordinate';

// Closed list for path finding has two columns in a row
// 0: coordinates of the node
// 1: coordinates of the previous node
export interface ClosedList extends Array<[Coordinate, Coordinate]>{}