import { Injectable } from '@angular/core';
import { Coordinate } from '../models/coordinate';
import { BinaryHeap } from '../models/binaryHeap';
import { ClosedList } from '../models/closedList';
import { Level } from '../models/level';
import { Tile } from '../models/tile';

@Injectable({
  providedIn: 'root'
})
export class PathFinderService {
  constructor() { }

  private target: Coordinate;
  private start: Coordinate;
  private currentLevel: Level;

  private openList: BinaryHeap;
  private closedList: ClosedList;

  /**
   * Provides main function of the service: finding a path from one node to another one and gives back an array of coordinates,
   * which will lead from the cursor to the desired target.
   * @param startNode target of the click, but because of the way the algorithm works, it's easier to start at the desired target node
   * @param targetNode current cursor position
   * @param currentLevel level instance that is currently played
   */
  findPath(startNode: Coordinate, targetNode: Coordinate, currentLevel: Level): Coordinate[] {
    if (!startNode || !targetNode || !currentLevel) {
      return [];
    }

    this.start = startNode;
    this.target = targetNode;
    this.currentLevel = currentLevel;
    this.closedList = [];

    // Count of jumps the node is away from the start node.
    let hops = 0;
    this.openList = new BinaryHeap(this.getSiblingNodes(this.start, hops));
    this.moveToClosedList([0, this.start, null, 0]);
    let nextNode = this.getNextTarget();
    hops = nextNode ? nextNode[3] : 0;

    // Processes the node that has currently the lowest value.
    // Stops when there are no elements left to inspect or the target is found.
    while (nextNode) {
      hops++;
      const siblings = this.getSiblingNodes(nextNode[1], hops);
      for (const sibling of siblings) {
        this.addToOpenList(sibling);
      }
      this.moveToClosedList(nextNode);
      // Case next node to inspect would be the target node, so inspection is not necessary.
      if (nextNode[1].isEqual(this.target)) {
        break;
      } else {
        nextNode = this.getNextTarget();
      }
    }

    return this.getPathFromClosedList();
  }

  /**
   * Finds every sibling of an given node, checks if they exist and that the cursor can walk on them,
   * calculates the value for each of them and returns the ones that are relevant for the open list.
   * @param node element to find the siblings for
   * @param hops count of jumps since the beginning of the path
   */
  private getSiblingNodes(node: Coordinate, hops: number): Array<[number, Coordinate, Coordinate, number]> {
    const siblingsArray = new Array<[number, Coordinate, Coordinate, number]>();
    let sibling: Coordinate;

    // above
    if (node.y - 1 !== 0 && this.isWalkable(new Coordinate(node.x, node.y - 1))) {
      sibling = new Coordinate(node.x, node.y - 1);
      siblingsArray.push([this.calcValue(sibling, hops), sibling, node, hops]);
    }
    // right
    if (node.x + 1 !== this.currentLevel.tiles[node.y].length - 1 && this.isWalkable(new Coordinate(node.x + 1, node.y))) {
      sibling = new Coordinate(node.x + 1, node.y);
      siblingsArray.push([this.calcValue(sibling, hops), sibling, node, hops]);
    }
    // underneath
    if (node.y + 1 !== this.currentLevel.tiles.length - 1 && this.isWalkable(new Coordinate(node.x, node.y + 1))) {
      sibling = new Coordinate(node.x, node.y + 1);
      siblingsArray.push([this.calcValue(sibling, hops), sibling, node, hops]);
    }
    // left
    if (node.x - 1 !== 0 && this.isWalkable(new Coordinate(node.x - 1, node.y))) {
      sibling = new Coordinate(node.x - 1, node.y);
      siblingsArray.push([this.calcValue(sibling, hops), sibling, node, hops]);
    }

    return siblingsArray;
  }

  /**
   * Takes a node with it's previous node, his value and his count of jumps and adds it for the open list.
   * If the node is already on the open list and the count of jumps is now lower, the element gets an update on the open list.
   * If the node is already on the closed list it won't be added again.
   * @param nodeElement a node with it's value, coordinates, coordinates of the previous node and his count of jumps since the start node
   */
  private addToOpenList(nodeElement: [number, Coordinate, Coordinate, number]): void {
    let foundElementOpenList = false;
    let foundElementClosedList = false;

    // Check if element exists on open list.
    let row = 0;
    for (const column of this.openList.heap) {
      if (
        column.find(x => {
          if (x instanceof Coordinate) {
            return x.isEqual(nodeElement[1]);
          }
        })
      ) {
        foundElementOpenList = true;
        break;
      }
      row++;
    }
    // Check if element exists on closed list.
    for (const column of this.closedList) {
      if (column[0].isEqual(nodeElement[1])) {
        foundElementClosedList = true;
      }
    }

    /* No use case found for that scenario
    // Updates entry on open list, if the hops are lower.
    if (foundElementOpenList && nodeElement[3] < this.openList.heap[row][3]) {
      this.openList.heap[row][2] = nodeElement[2];
      this.openList.heap[row][3] = nodeElement[3];
      this.openList.decrease(row, this.calcValue(nodeElement[1], nodeElement[3]));
      // Adds the element to the open list, if it hasen't been on the open or closed list.
    } else if */
    if (!foundElementOpenList && !foundElementClosedList) {
      this.openList.insert(nodeElement);
    }
  }

  /**
   * Returns the element of the open list with the lowest value and removes it from the list.
   */
  private getNextTarget(): [number, Coordinate, Coordinate, number] {
    const target = this.openList.getNextTarget();
    if (target) {
      this.openList.remove(0);
      return target;
    } else {
      return null;
    }
  }

  /**
   * Adds an element to the closed list.
   * @param nodeElement element from the open list
   */
  private moveToClosedList(nodeElement: [number, Coordinate, Coordinate, number]): void {
    // The first element contains the coordinates of the node, the second contains the coordinates from the previous node.
    this.closedList.push([nodeElement[1], nodeElement[2]]);
  }

  /**
   * Loops through the closed list, beginning from the cursor node, after finding the entry, adds it to the path,
   * then it takes the previous node coordinates of this entry, search for that entry and so on until the list is empty,
   * or the target is found. After all it returns the path.
   */
  private getPathFromClosedList(): Array<Coordinate> {
    const path: Array<Coordinate> = [];
    let nextTarget = this.target;

    do {
      let findElement: [Coordinate, Coordinate];
      let indexToDelete: number;

      // Searches for an entry which first coordinates matches the target ones.
      findElement = this.closedList.find(x => x[0].isEqual(nextTarget));

      if (findElement && findElement[1]) {
        nextTarget = findElement[1];
        indexToDelete = this.closedList.indexOf(findElement);
        this.closedList.splice(indexToDelete, 1);
        path.push(nextTarget);
      } else {
        // When the target element is not found, something went wrong.
        break;
      }
    } while (this.closedList.length > 0 && !nextTarget.isEqual(this.start));

    return path;
  }

  /**
   * Returns the calculated value which is necessary for prioritizing the open list.
   * The value is a sum of the count of jumps since the start node and the euclidean distance between the target and the given node.
   * @param node element for which the value should be calculated for
   * @param hops count of jumps/moves since the start node
   */
  private calcValue(node: Coordinate, hops: number): number {
    // Formula euclidean distance: squareroot of ((x1-x2)²+(y1-y2)²)
    const distance = Math.sqrt(Math.pow(node.x - this.target.x, 2) + Math.pow(node.y - this.target.y, 2));
    return hops + distance;
  }

  /**
   * Checks whether the given node is a field on which the cursor can move to or not.
   * @param node element for which the nature of the ground should get checked
   */
  private isWalkable(node: Coordinate): boolean {
    return this.currentLevel.tiles[node.y][node.x] === Tile.target || this.currentLevel.tiles[node.y][node.x] === Tile.floor;
  }
}
