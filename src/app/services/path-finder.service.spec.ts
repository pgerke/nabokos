import { PathFinderService } from './path-finder.service';
import { TestBed } from '@angular/core/testing';
import { LevelService } from './level.service';
import { Coordinate, Level, BinaryHeap, ClosedList } from '../models';
import { RouterTestingModule } from '@angular/router/testing';

describe('PathFinderService', () => {
  let pathFinderService: PathFinderService;
  let levelService: LevelService;
  let level: Level;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    pathFinderService = TestBed.inject(PathFinderService);
    levelService = TestBed.inject(LevelService);

    const serialized = `####
#   #
# ##
#   #
#   #
#@ .#
####`;

    level = levelService.loadLevel(serialized);
  });

  it('should be created', async () => {
    await expect(pathFinderService).toBeTruthy();
  });

  it('should return an empty path, if target and start are the same', async () => {
    const result = pathFinderService.findPath(new Coordinate(1, 1), new Coordinate(1, 1), level);
    await expect((pathFinderService as unknown as { openList: BinaryHeap }).openList.heap.length).toBe(0);
    await expect(result).toEqual([]);
  });

  it('should return an empty path, if the parameters are wrong', async () => {
    const result = pathFinderService.findPath(null, new Coordinate(1, 1), level);
    await expect(result).toEqual([]);
  });

  it('should return an empty path, if the target lays outside the grid', async () => {
    const result = pathFinderService.findPath(new Coordinate(4, 2), new Coordinate(1, 1), level);
    await expect(result).toEqual([]);
  });

  it('should find the path from the start to the given target', async () => {
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
    await expect(result).toEqual(path);
  });

  it('should get all siblings from a given node', async () => {
    const node = new Coordinate(2, 4);
    (pathFinderService as unknown as { currentLevel: Level }).currentLevel = level;
    (pathFinderService as unknown as { target: Coordinate }).target = node;
    const result = (pathFinderService as unknown as { getSiblingNodes(x: Coordinate, y: number): unknown[][] }).getSiblingNodes(node, 1);
    await expect(result.length).toBe(4);
    await expect(result[0][1]).toEqual(new Coordinate(2, 3));
    await expect(result[1][1]).toEqual(new Coordinate(3, 4));
    await expect(result[2][1]).toEqual(new Coordinate(2, 5));
    await expect(result[3][1]).toEqual(new Coordinate(1, 4));
  });

  it('should get only the siblings from a given node, which are walkable', async () => {
    const node = new Coordinate(3, 1);
    (pathFinderService as unknown as { currentLevel: Level }).currentLevel = level;
    (pathFinderService as unknown as { target: Coordinate }).target = node;
    const result = (pathFinderService as unknown as { getSiblingNodes(x: Coordinate, y: number): unknown[][] }).getSiblingNodes(node, 1);
    await expect(result.length).toBe(1);
    await expect(result[0][1]).toEqual(new Coordinate(2, 1));
  });

  it('should not get any siblings from a given node, when it is outside the grid', async () => {
    const node = new Coordinate(6, 1);
    (pathFinderService as unknown as { currentLevel: Level }).currentLevel = level;
    (pathFinderService as unknown as { target: Coordinate }).target = node;
    const result = (pathFinderService as unknown as { getSiblingNodes(x: Coordinate, y: number): unknown[][] }).getSiblingNodes(node, 1);
    await expect(result.length).toBe(0);
  });

  it('should add a given element to the open list', async () => {
    const node = new Coordinate(3, 1);
    (pathFinderService as unknown as { currentLevel: Level }).currentLevel = level;
    (pathFinderService as unknown as { closedList: ClosedList }).closedList = [];
    (pathFinderService as unknown as { openList: BinaryHeap }).openList = new BinaryHeap([[0, node, null, 0]]);
    (pathFinderService as unknown as { addToOpenList(x: [number, Coordinate, Coordinate, number]): void})
    .addToOpenList([1, new Coordinate(2, 3), node, 1]);
    await expect((pathFinderService as unknown as { openList: BinaryHeap }).openList.heap.length).toBe(2);
  });

  it('should not add a given element to the open list if it is already on open or closed list', async () => {
    const node = new Coordinate(3, 1);
    const closedNode = new Coordinate(4, 3);
    (pathFinderService as unknown as { currentLevel: Level }).currentLevel = level;
    (pathFinderService as unknown as { closedList: ClosedList }).closedList = [[closedNode, null]];
    (pathFinderService as unknown as { openList: BinaryHeap }).openList = new BinaryHeap([[0, node, null, 0]]);

    (pathFinderService as unknown as { addToOpenList(x: [number, Coordinate, Coordinate, number]): void})
    .addToOpenList([1, node, new Coordinate(2, 3), 1]);
    await expect((pathFinderService as unknown as { openList: BinaryHeap }).openList.heap.length).toBe(1);

    (pathFinderService as unknown as { addToOpenList(x: [number, Coordinate, Coordinate, number]): void})
    .addToOpenList([1, closedNode, new Coordinate(2, 3), 1]);
    await expect((pathFinderService as unknown as { openList: BinaryHeap }).openList.heap.length).toBe(1);
  });

  it('should return the path from the closed list correctly', async () => {
    (pathFinderService as unknown as { target: Coordinate }).target = new Coordinate(3, 1);
    (pathFinderService as unknown as { start: Coordinate }).start = new Coordinate(1, 0);
    (pathFinderService as unknown as { closedList: ClosedList }).closedList = [
      [new Coordinate(2, 0), new Coordinate(1, 0)],
      [new Coordinate(3, 1), new Coordinate(2, 1)],
      [new Coordinate(2, 1), new Coordinate(2, 0)]
    ];
    const result = (pathFinderService as unknown as { getPathFromClosedList(): Array<Coordinate> }).getPathFromClosedList();
    await expect(result).toEqual([
      new Coordinate(2, 1),
      new Coordinate(2, 0),
      new Coordinate(1, 0)
    ]);
  });

  it('should return an empty path, if closed list is empty', async () => {
    (pathFinderService as unknown as { target: Coordinate }).target = new Coordinate(3, 1);
    (pathFinderService as unknown as { start: Coordinate }).start = new Coordinate(1, 0);
    (pathFinderService as unknown as { closedList: ClosedList }).closedList = [];
    const result = (pathFinderService as unknown as { getPathFromClosedList(): Array<Coordinate> }).getPathFromClosedList();
    await expect(result).toEqual([]);
  });
});
