import { BinaryHeap } from './binaryHeap';
import { Coordinate } from './coordinate';
import { OpenList } from './openList';

describe('BinaryHeap', () => {
  let binaryHeap: BinaryHeap;

  it('should transform the given array to an binary heap', () => {
    const firstDummyCoordinate = new Coordinate(1, 0);
    const secondDummyCoordinate = new Coordinate(2, 0);
    const startArray: OpenList = [
      [5, firstDummyCoordinate, secondDummyCoordinate, 0],
      [0, firstDummyCoordinate, secondDummyCoordinate, 0],
      [1, firstDummyCoordinate, secondDummyCoordinate, 0],
      [7, firstDummyCoordinate, secondDummyCoordinate, 0],
      [3, firstDummyCoordinate, secondDummyCoordinate, 0],
    ];
    binaryHeap = new BinaryHeap(startArray);

    expect(binaryHeap.heap.length).toBe(5);
    expect(binaryHeap.heap[0][0]).toBe(0);
    expect(binaryHeap.heap[1][0]).toBeLessThan(5);
  });

  it('should remove an existing node correctly, and should swap elements, if heap is not correct afterwards', () => {
    const firstDummyCoordinate = new Coordinate(1, 0);
    const secondDummyCoordinate = new Coordinate(2, 0);
    const startArray: OpenList = [
      [5, firstDummyCoordinate, secondDummyCoordinate, 0],
      [0, firstDummyCoordinate, secondDummyCoordinate, 0],
      [1, firstDummyCoordinate, secondDummyCoordinate, 0],
      [7, firstDummyCoordinate, secondDummyCoordinate, 0],
      [3, firstDummyCoordinate, secondDummyCoordinate, 0],
      [2, firstDummyCoordinate, secondDummyCoordinate, 0]
    ];
    binaryHeap = new BinaryHeap(startArray);

    const oldLength = binaryHeap.heap.length;
    spyOn(binaryHeap, 'decrease').and.callThrough();
    binaryHeap.remove(4);
    expect(binaryHeap.heap.length).toBe(oldLength - 1);
    expect(binaryHeap.decrease).toHaveBeenCalled();
  });

  it('should return null if there is an empty heap', () => {
    binaryHeap = new BinaryHeap([]);
    const result = binaryHeap.getNextTarget();
    expect(result).toBeNull();
  });

  beforeEach(() => {
    binaryHeap = new BinaryHeap([
      [0, new Coordinate(1, 1), new Coordinate(1, 2), 0],
      [3, new Coordinate(2, 1), new Coordinate(2, 2), 0],
    ]);
  });

  it('should be created', () => {
    expect(binaryHeap).toBeTruthy();
  });

  it('should add a new node element correctly', () => {
    const newItem: [number, Coordinate, Coordinate, number] = [4, new Coordinate(1, 3), new Coordinate(2, 6), 1];
    const oldLength = binaryHeap.heap.length;
    binaryHeap.insert(newItem);
    expect(binaryHeap.heap.length).toBe(oldLength + 1);
    expect(binaryHeap.heap[2][0]).toBe(4);
  });

  it('should remove an existing node correctly, which is inbetween', () => {
    const newItem: [number, Coordinate, Coordinate, number] = [2, new Coordinate(1, 3), new Coordinate(2, 6), 1];
    binaryHeap.insert(newItem);
    const oldLength = binaryHeap.heap.length;
    binaryHeap.remove(1);
    expect(binaryHeap.heap.length).toBe(oldLength - 1);
  });

  it('should remove an existing node correctly, at the last position', () => {
    const newItem: [number, Coordinate, Coordinate, number] = [5, new Coordinate(1, 3), new Coordinate(2, 6), 1];
    binaryHeap.insert(newItem);
    const oldLength = binaryHeap.heap.length;
    binaryHeap.remove(2);
    expect(binaryHeap.heap.length).toBe(oldLength - 1);
  });

  it('should decrease a node if the value of it got lower', () => {
    const newItem: [number, Coordinate, Coordinate, number] = [2, new Coordinate(1, 3), new Coordinate(2, 6), 1];
    const secondNewItem: [number, Coordinate, Coordinate, number] = [5, new Coordinate(1, 3), new Coordinate(2, 6), 1];
    binaryHeap.insert(newItem);
    binaryHeap.insert(secondNewItem);
    binaryHeap.decrease(3, 1);
    expect(binaryHeap.heap[3][0]).toBeGreaterThan(binaryHeap.heap[1][0]);
  });

  it('should return the first element of the heap', () => {
    const result = binaryHeap.getNextTarget();
    expect(result).not.toBeNull();
    expect(result[0]).toBe(0);
  });
});