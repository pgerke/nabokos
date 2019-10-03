export class Coordinate {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns whether or not, the given node has the same coordinates as this one.
   * @param node element for comparison
   */
  isEqual(node: Coordinate) {
    return node.x === this.x && node.y === this.y;
  }
}
