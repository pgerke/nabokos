import { PathFinderService } from './pathFinder.service';
import { TestBed } from '@angular/core/testing';
import { LevelService } from './level.service';
import { Coordinate } from '../models/coordinate';
import { Level } from '../models/level';
import { BinaryHeap } from '../models/binaryHeap';

describe('PathFinderService', () => {
  let pathFinderService: PathFinderService;
  let levelService: LevelService;
  let level: Level;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pathFinderService = TestBed.get(PathFinderService);
    levelService = TestBed.get(LevelService);

    const serialized = `####
#   #
# ###
#   #
#   #
#@ .#
####`;

    level = levelService.loadLevel(serialized, 'Test');
  });

  it('should be created', () => {
    expect(pathFinderService).toBeTruthy();
  });

  it('should return an empty path, if target and start are the same', () => {
    const result = pathFinderService.findPath(new Coordinate(1, 1), new Coordinate(1, 1), level);
    expect((pathFinderService as any)._openList.heap.length).toBe(0);
    expect(result).toEqual([]);
  });

  it('should return an empty path, if the parameters are wrong', () => {
    const result = pathFinderService.findPath(null, new Coordinate(1, 1), level);
    expect(result).toEqual([]);
  });

  it('should find the path from the start to the given target', () => {
    const target = new Coordinate(3, 1);
    const result = pathFinderService.findPath(target, level.cursor, level);
    const path = [
      new Coordinate(1, 4),
      new Coordinate(1, 3),
      new Coordinate(1, 2),
      new Coordinate(1, 1),
      new Coordinate(2, 1),
      new Coordinate(3, 1),
    ];
    expect(result).toEqual(path);
  })

  it('should get all siblings from a given node', () => {
    const node = new Coordinate(2, 4);
    (pathFinderService as any)._currentLevel = level;
    (pathFinderService as any)._target = node;
    const result = (pathFinderService as any).getSiblingNodes(node, 1);
    expect(result.length).toBe(4);
    expect(result[0][1]).toEqual(new Coordinate(2, 3));
    expect(result[1][1]).toEqual(new Coordinate(3, 4));
    expect(result[2][1]).toEqual(new Coordinate(2, 5));
    expect(result[3][1]).toEqual(new Coordinate(1, 4));
  });

  it('should get only the siblings from a given node, which are walkable', () => {
    const node = new Coordinate(3, 1);
    (pathFinderService as any)._currentLevel = level;
    (pathFinderService as any)._target = node;
    const result = (pathFinderService as any).getSiblingNodes(node, 1);
    expect(result.length).toBe(1);
    expect(result[0][1]).toEqual(new Coordinate(2, 1));
  });

  it('should not get any siblings from a given node, when it is outside the grid', () => {
    const node = new Coordinate(6, 1);
    (pathFinderService as any)._currentLevel = level;
    (pathFinderService as any)._target = node;
    const result = (pathFinderService as any).getSiblingNodes(node, 1);
    expect(result.length).toBe(0);
  });

  it('should add a given element to the open list', () => {
    const node = new Coordinate(3, 1);
    (pathFinderService as any)._currentLevel = level;
    (pathFinderService as any)._closedList = [];
    (pathFinderService as any)._openList = new BinaryHeap([[0, node, null, 0]]);
    (pathFinderService as any).addToOpenList([1, new Coordinate(2, 3), node, 1]);
    expect((pathFinderService as any)._openList.heap.length).toBe(2);
  });

  it('should not add a given element to the open list if it is already on open or closed list', () => {
    const node = new Coordinate(3, 1);
    const closedNode = new Coordinate(4, 3);
    (pathFinderService as any)._currentLevel = level;
    (pathFinderService as any)._closedList = [[closedNode, null]];
    (pathFinderService as any)._openList = new BinaryHeap([[0, node, null, 0]]);

    (pathFinderService as any).addToOpenList([1, node, new Coordinate(2, 3), 1]);
    expect((pathFinderService as any)._openList.heap.length).toBe(1);

    (pathFinderService as any).addToOpenList([1, closedNode, new Coordinate(2, 3), 1]);
    expect((pathFinderService as any)._openList.heap.length).toBe(1);
  });

  it('should return the path from the closed list correctly', () => {
    (pathFinderService as any)._target = new Coordinate(3, 1);
    (pathFinderService as any)._start = new Coordinate(1, 0);
    (pathFinderService as any)._closedList = [
      [new Coordinate(2, 0), new Coordinate(1, 0)],
      [new Coordinate(3, 1), new Coordinate(2, 1)],
      [new Coordinate(2, 1), new Coordinate(2, 0)]
    ];
    const result = (pathFinderService as any).getPathFromClosedList();
    expect(result).toEqual([
      new Coordinate(2, 1),
      new Coordinate(2, 0),
      new Coordinate(1, 0)
    ]);
  });

  it('should return an empty path, if closed list is empty', () => {
    (pathFinderService as any)._target = new Coordinate(3, 1);
    (pathFinderService as any)._start = new Coordinate(1, 0);
    (pathFinderService as any)._closedList = [];
    const result = (pathFinderService as any).getPathFromClosedList();
    expect(result).toEqual([]);
  });

});