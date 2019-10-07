import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LevelService } from './services/level.service';
import { TileComponent } from './tile/tile.component';
import { Direction } from './models/direction';
import { Coordinate } from './models/coordinate';
import { Tile } from './models/tile';
import { PathFinderService } from './services/pathFinder.service';

describe('AppComponent', () => {
  let app: AppComponent;
  let levelService: LevelService;
  let pathFinderService: PathFinderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        TileComponent
      ],
      providers: [
        LevelService,
        PathFinderService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    levelService = TestBed.get(LevelService);
    pathFinderService = TestBed.get(PathFinderService);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have as title 'nabokos'`, () => {
    expect(app.title).toEqual('nabokos');
  });

  it('should check win', () => {
    const testLevelSerialized = `####
#.$@#
####`;
    const level = levelService.loadLevel(testLevelSerialized, 'Test Level');
    app.level = level;
    app.checkWin();
    expect(app.isWin).toBeFalsy();
    app.run(Direction.Left);
    expect(app.isWin).toBeTruthy();
  });

  it('should calculate next coordinate', () => {
    const original = new Coordinate(0, 0);
    let altered = app.getNextCoordinate(original, Direction.Up);
    expect(altered).toEqual(new Coordinate(0, -1));
    altered = app.getNextCoordinate(original, Direction.Right);
    expect(altered).toEqual(new Coordinate(1, 0));
    altered = app.getNextCoordinate(original, Direction.Down);
    expect(altered).toEqual(new Coordinate(0, 1));
    altered = app.getNextCoordinate(original, Direction.Left);
    expect(altered).toEqual(new Coordinate(-1, 0));
  });

  it('should process direction keyboard events', () => {
    const undoSpy = spyOn(app, 'undo');
    const runSpy = spyOn(app, 'run');
    const values = [
      { input: 'w', direction: Direction.Up },
      { input: 's', direction: Direction.Down },
      { input: 'a', direction: Direction.Left },
      { input: 'd', direction: Direction.Right },
      { input: 'W', direction: Direction.Up },
      { input: 'S', direction: Direction.Down },
      { input: 'A', direction: Direction.Left },
      { input: 'D', direction: Direction.Right },
      { input: 'ArrowUp', direction: Direction.Up },
      { input: 'ArrowDown', direction: Direction.Down },
      { input: 'ArrowLeft', direction: Direction.Left },
      { input: 'ArrowRight', direction: Direction.Right },
    ];
    values.forEach(({ input, direction }, _) => {
      app.keyEvent(new KeyboardEvent('keyup', { key: input }));
      expect(undoSpy).not.toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalledWith(direction);
      runSpy.calls.reset();
    });

    app.keyEvent(new KeyboardEvent('keyup', { key: 'x' }));
    expect(undoSpy).not.toHaveBeenCalled();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('should process undo keyboard events', () => {
    const undoSpy = spyOn(app, 'undo');
    const runSpy = spyOn(app, 'run');
    const values = ['z', 'Z', 'Backspace'];
    values.forEach((input, x) => {
      app.keyEvent(new KeyboardEvent('keyup', { key: input }));
      expect(undoSpy).toHaveBeenCalledTimes(x + 1);
      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  it('should get next level from service and reset', () => {
    const testLevelSerialized = `####
#.$@#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    spyOn(levelService, 'getNextLevel').and.returnValue(testLevel);
    app.next();
    expect(app.level).toEqual(testLevel);
  });

  it('should get previous level from service and reset', () => {
    const testLevelSerialized = `####
#.$@#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    spyOn(levelService, 'getPreviousLevel').and.returnValue(testLevel);
    app.previous();
    expect(app.level).toEqual(testLevel);
  });

  it('should push box correctly', () => {
    const testLevelSerialized1 = `####
#. @#
####`;
    let testLevel = levelService.loadLevel(testLevelSerialized1, 'Test Level');
    app.level = testLevel;
    expect(app.pushBox(new Coordinate(2, 1), Direction.Left)).toBeFalsy();

    const testLevelSerialized2 = `####
#*$@#
####`;
    testLevel = levelService.loadLevel(testLevelSerialized2, 'Test Level');
    app.level = testLevel;
    expect(app.pushBox(new Coordinate(2, 1), Direction.Left)).toBeFalsy();

    const testLevelSerialized3 = `####
# *@#
####`;
    testLevel = levelService.loadLevel(testLevelSerialized3, 'Test Level');
    app.level = testLevel;
    expect(app.pushBox(new Coordinate(2, 1), Direction.Left)).toBeTruthy();
  });

  it('should not run if cannot move or push box', () => {
    spyOn(app, 'moveCursor').and.returnValue(false);
    spyOn(app, 'pushBox').and.returnValue(false);
    const spy = spyOn(app, 'saveHistory');
    app.run(Direction.Left);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save the history', () => {
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    let i = 0;
    while (i++ < 1000) {
      app.saveHistory(testLevel);
      expect(app.history.length).toBe(i);
    }
    app.saveHistory(testLevel);
    expect(app.history.length).toBe(1000);
  });

  it('should undo', () => {
    app.undo();
    expect(app.counter).toBe(0);
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    spyOn(levelService, 'getNextLevel').and.returnValue(testLevel);
    app.next();
    app.run(Direction.Left);
    app.undo();
    expect(app.counter).toBe(2);
    expect(app.level).toEqual(testLevel);
  });

  it('should do nothing on click, when the clicked element is a wall', fakeAsync(() => {
    const cursor = app.level.cursor;
    app.moveToClick('wall', cursor.x + 1, cursor.y);
    tick(200);
    expect(app.level.cursor).toBe(cursor);
  }));

  it('should move the cursor and box, when the cursor is next to a box and the box is clicked', fakeAsync(() => {
    const cursor = app.level.cursor;
    const box = new Coordinate(cursor.x + 1, cursor.y);
    app.level.tiles[box.y][box.x] = Tile.box;

    const spyRun = spyOn(app, 'run');
    spyRun.and.callThrough();

    app.moveToClick('box', box.x, box.y);
    tick(400);
    expect(app.level.cursor).toEqual(box);
    expect(app.level.tiles[box.y][box.x + 1]).toBe(Tile.box);
    expect(spyRun).toHaveBeenCalled();

    app.level.tiles[box.y][box.x + 1] = Tile.targetWithBox;
    app.level.cursor = cursor;
    spyRun.and.callThrough();

    app.moveToClick('targetWithBox', box.x, box.y);
    tick(400);
    expect(app.level.cursor).toEqual(box);
    expect(app.level.tiles[box.y][box.x + 1]).toBe(Tile.targetWithBox);
    expect(spyRun).toHaveBeenCalled();
  }));

  it('should only move the cursor not the box, when the cursor is not next to a box and the box is clicked', fakeAsync(() => {
    const serialized = `####
  #   #
  #   #
  #@  #
  ####`;
    app.level = levelService.loadLevel(serialized, 'Test');
    const cursor = app.level.cursor;
    const box = new Coordinate(cursor.x + 2, cursor.y);
    app.level.tiles[box.y][box.x] = Tile.box;

    app.moveToClick('box', box.x, box.y);
    tick(400);
    expect(app.level.cursor).toEqual(new Coordinate(cursor.x + 1, cursor.y));
    expect(app.level.tiles[box.y][box.x]).toBe(Tile.box);
  }));

  it('should move the cursor to the clicked target, if a path was found', fakeAsync(() => {
    const serialized = `####
#   #
#   #
#@  #
####`;
    app.level = levelService.loadLevel(serialized, 'Test');
    spyOn(pathFinderService, 'findPath').and.returnValue([new Coordinate(2, 1), new Coordinate(1, 1)]);
    spyOn(app, 'walkAlongPath').and.callThrough();
    app.moveToClick('floor', 1, 1);
    tick(400);
    expect(app.walkAlongPath).toHaveBeenCalled();
    expect(app.level.cursor).toEqual(new Coordinate(1, 1));
    expect(pathFinderService.findPath).toHaveBeenCalled();
  }));

  it('should not move the cursor to the clicked target, if no path was found', fakeAsync(() => {
    const cursor = app.level.cursor;
    spyOn(pathFinderService, 'findPath').and.returnValue([]);
    app.moveToClick('floor', 1, 1);
    tick(200);
    expect(app.level.cursor).toEqual(cursor);
    expect(pathFinderService.findPath).toHaveBeenCalled();
  }));

  it('should move the cursor to the new target, if clicked again', fakeAsync(() => {
    const serialized = `####
#   #
#   #
#@  #
####`;
    app.level = levelService.loadLevel(serialized, 'Test');

    app.moveToClick('floor', 1, 1);
    tick(100);
    app.moveToClick('floor', 3, 2);
    tick(600);

    expect(app.level.cursor).toEqual(new Coordinate(3, 2));
  }));

  it('should get the right direction for moving a box by click, when the cursor stands next to it', () => {
    const serialized = `####
#   #
#@. #
#   #
####`;
    app.level = levelService.loadLevel(serialized, 'Test');
    const box = new Coordinate(2, 2);
    let result = app.getBoxMoveDirection(box);
    expect(result).toBe(Direction.Right);

    app.level.cursor = new Coordinate(box.x, box.y + 1);
    result = app.getBoxMoveDirection(box);
    expect(result).toBe(Direction.Up);

    app.level.cursor = new Coordinate(box.x + 1, box.y);
    result = app.getBoxMoveDirection(box);
    expect(result).toBe(Direction.Left);

    app.level.cursor = new Coordinate(box.x, box.y - 1);
    result = app.getBoxMoveDirection(box);
    expect(result).toBe(Direction.Down);
  });

  it('should not get a direction for moving a box by click, when the cursor does not stand next to it', () => {
    const serialized = `####
#   #
# . #
#@  #
####`;
    app.level = levelService.loadLevel(serialized, 'Test');
    const box = new Coordinate(2, 2);
    let result = app.getBoxMoveDirection(box);
    expect(result).toBe(null);
  });
});
