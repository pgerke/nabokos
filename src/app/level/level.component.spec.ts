import { async, ComponentFixture, TestBed, tick, fakeAsync, inject } from '@angular/core/testing';
import { LevelComponent } from './level.component';
import { Direction } from '../models/direction';
import { LevelService } from '../services/level.service';
import { HighscoreService } from '../services/highscore.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TileComponent } from '../tile/tile.component';
import { Coordinate } from '../models/coordinate';
import { Router, ActivatedRoute } from '@angular/router';
import { Savegame } from '../models/savegame';
import { of } from 'rxjs';
import { Tile } from '../models/tile';
import { PathFinderService } from '../services/pathFinder.service';

describe('LevelComponent (shallow)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        LevelComponent,
        TileComponent
      ],
      providers: [
        LevelService,
        HighscoreService,
        PathFinderService
      ]
    })
      .compileComponents();
  }));

  it('should processs timer', () => {
    localStorage.clear();
    const levelService = new LevelService(null);
    const highscoreService = new HighscoreService();
    const pathFinderService = new PathFinderService();
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    const savegame: Savegame = {
      history: [],
      level: testLevel,
      levelId: 1,
      levelTime: 234000,
      moves: 567
    };
    localStorage.setItem('savegame', JSON.stringify(savegame));
    const route = new ActivatedRoute();
    route.params = of({
      level: 1
    });
    const lvl = new LevelComponent(levelService, highscoreService, null, route, pathFinderService);
    lvl.ngOnInit();
    expect(lvl.levelTime).toBe(234000);
    expect(lvl.counter).toBe(567);
    lvl.ngOnDestroy();
  });

  it('should processs timer', fakeAsync(() => {
    localStorage.clear();
    const levelService = new LevelService(null);
    const highscoreService = new HighscoreService();
    const pathFinderService = new PathFinderService();
    const route = new ActivatedRoute();
    route.params = of({
      level: 0
    });
    const lvl = new LevelComponent(levelService, highscoreService, null, route, pathFinderService);
    lvl.ngOnInit();
    expect(lvl.levelTimerSubscription).toBeDefined();
    expect(lvl.levelStarted).toBeFalsy();
    expect(lvl.levelTime).toBe(0);
    tick(2500);
    expect(lvl.levelStarted).toBeFalsy();
    expect(lvl.levelTime).toBe(0);
    lvl.run(Direction.Left);
    expect(lvl.levelStarted).toBeTruthy();
    tick(2500);
    expect(lvl.levelTime).toBeGreaterThan(2500);
    lvl.ngOnDestroy();
  }));
});

describe('LevelComponent', () => {
  let component: LevelComponent;
  let fixture: ComponentFixture<LevelComponent>;
  let levelService: LevelService;
  let pathFinderService: PathFinderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        LevelComponent,
        TileComponent
      ],
      providers: [
        LevelService,
        HighscoreService,
        PathFinderService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(LevelComponent);
    component = fixture.componentInstance;
    levelService = TestBed.get(LevelService);
    pathFinderService = TestBed.get(PathFinderService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check win', () => {
    const testLevelSerialized = `####
#.$@#
####`;
    const level = levelService.loadLevel(testLevelSerialized, 'Test Level');
    component.level = level;
    component.checkWin();
    expect(component.isWin).toBeFalsy();
    component.run(Direction.Left);
    expect(component.isWin).toBeTruthy();
  });

  it('should calculate next coordinate', () => {
    const original = new Coordinate(0, 0);
    let altered = component.getNextCoordinate(original, Direction.Up);
    expect(altered).toEqual(new Coordinate(0, -1));
    altered = component.getNextCoordinate(original, Direction.Right);
    expect(altered).toEqual(new Coordinate(1, 0));
    altered = component.getNextCoordinate(original, Direction.Down);
    expect(altered).toEqual(new Coordinate(0, 1));
    altered = component.getNextCoordinate(original, Direction.Left);
    expect(altered).toEqual(new Coordinate(-1, 0));
  });

  it('should process direction keyboard events', () => {
    const undoSpy = spyOn(component, 'undo');
    const runSpy = spyOn(component, 'run');
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
      { input: 'ArrowRight', direction: Direction.Right }
    ];
    values.forEach(({ input, direction }, _) => {
      component.keyEvent(new KeyboardEvent('keyup', { key: input }));
      expect(undoSpy).not.toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalledWith(direction);
      runSpy.calls.reset();
    });

    component.keyEvent(new KeyboardEvent('keyup', { key: 'x' }));
    expect(undoSpy).not.toHaveBeenCalled();
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('should process undo keyboard events', () => {
    const undoSpy = spyOn(component, 'undo');
    const runSpy = spyOn(component, 'run');
    const values = ['z', 'Z', 'Backspace'];
    values.forEach((input, x) => {
      component.keyEvent(new KeyboardEvent('keyup', { key: input }));
      expect(undoSpy).toHaveBeenCalledTimes(x + 1);
      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  it('should request next level from service', () => {
    const spy = spyOn(levelService, 'getNextLevel');
    component.next();
    expect(spy).toHaveBeenCalled();
  });

  it('should get previous level from service', () => {
    const spy = spyOn(levelService, 'getPreviousLevel');
    component.previous();
    expect(spy).toHaveBeenCalled();
  });

  it('should push box correctly', () => {
    const testLevelSerialized1 = `####
#. @#
####`;
    let testLevel = levelService.loadLevel(testLevelSerialized1, 'Test Level');
    component.level = testLevel;
    expect(component.pushBox(new Coordinate(2, 1), Direction.Left)).toBeFalsy();

    const testLevelSerialized2 = `####
#*$@#
####`;
    testLevel = levelService.loadLevel(testLevelSerialized2, 'Test Level');
    component.level = testLevel;
    expect(component.pushBox(new Coordinate(2, 1), Direction.Left)).toBeFalsy();

    const testLevelSerialized3 = `####
# *@#
####`;
    testLevel = levelService.loadLevel(testLevelSerialized3, 'Test Level');
    component.level = testLevel;
    expect(component.pushBox(new Coordinate(2, 1), Direction.Left)).toBeTruthy();
  });

  it('should not run if cannot move or push box', () => {
    spyOn(component, 'moveCursor').and.returnValue(false);
    spyOn(component, 'pushBox').and.returnValue(false);
    const spy = spyOn(component, 'saveHistory');
    component.run(Direction.Left);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save the history', () => {
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    let i = 0;
    while (i++ < 1000) {
      component.saveHistory(testLevel);
      expect(component.history.length).toBe(i);
    }
    component.saveHistory(testLevel);
    expect(component.history.length).toBe(1000);
  });

  it('should undo', () => {
    component.undo();
    expect(component.counter).toBe(0);
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    component.level = testLevel;
    component.run(Direction.Left);
    component.undo();
    expect(component.counter).toBe(2);
    expect(component.level.serialized).toEqual(testLevelSerialized);
  });

  it('should navigate to menu', inject([Router], router => {
    const saveSpy = spyOn(component, 'createSaveGame');
    const routerSpy = spyOn(router, 'navigate');

    component.showMenu();
    expect(saveSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['menu']);
  }));

  it('should create savegame', () => {
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    component.level = testLevel;
    component.levelId = 123;
    component.levelTime = 456000;
    component.counter = 789;
    const spy = spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      expect(key).toBe('savegame');
      const savegame: Savegame = JSON.parse(value) as Savegame;
      expect(savegame.levelId).toBe(component.levelId);
      expect(savegame.moves).toBe(component.counter);
      expect(savegame.levelTime).toBe(component.levelTime);
      expect(savegame.history).toEqual(component.history);
    });
    component.createSaveGame();
    expect(spy).toHaveBeenCalled();
  });

  it('should load savegame', () => {
    // should return false, if localStorage has no 'savegame' key
    expect(component.loadSaveGame()).toBeFalsy();

    // should return false, if the levelId in the saveGame
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized, 'Test Level');
    const savegame: Savegame = {
      history: [],
      level: testLevel,
      levelId: 123,
      levelTime: 456000,
      moves: 789
    };
    localStorage.setItem('savegame', JSON.stringify(savegame));
    expect(component.loadSaveGame()).toBeFalsy();

    // should load the saved game and return true
    component.levelId = 0;
    savegame.levelId = component.levelId;
    localStorage.setItem('savegame', JSON.stringify(savegame));
    expect(component.loadSaveGame()).toBeTruthy();
    expect(component.levelTime).toBe(savegame.levelTime);
  });

  it('should do nothing on click, when the clicked element is a wall', fakeAsync(() => {
    const cursor = component.level.cursor;
    component.moveToClick('wall', cursor.x + 1, cursor.y);
    tick(200);
    expect(component.level.cursor).toBe(cursor);
  }));

  it('should move the cursor and box, when the cursor is next to a box and the box is clicked', fakeAsync(() => {
    const cursor = component.level.cursor;
    const box = new Coordinate(cursor.x + 1, cursor.y);
    component.level.tiles[box.y][box.x] = Tile.box;

    const spyRun = spyOn(component, 'run');
    spyRun.and.callThrough();

    component.moveToClick('box', box.x, box.y);
    tick(400);
    expect(component.level.cursor).toEqual(box);
    expect(component.level.tiles[box.y][box.x + 1]).toBe(Tile.box);
    expect(spyRun).toHaveBeenCalled();

    component.level.tiles[box.y][box.x + 1] = Tile.targetWithBox;
    component.level.cursor = cursor;
    spyRun.and.callThrough();

    component.moveToClick('targetWithBox', box.x, box.y);
    tick(400);
    expect(component.level.cursor).toEqual(box);
    expect(component.level.tiles[box.y][box.x + 1]).toBe(Tile.targetWithBox);
    expect(spyRun).toHaveBeenCalled();
  }));

  it('should only move the cursor not the box, when the cursor is not next to a box and the box is clicked', fakeAsync(() => {
    const serialized = `####
  #   #
  #   #
  #@  #
  ####`;
    component.level = levelService.loadLevel(serialized, 'Test');
    const cursor = component.level.cursor;
    const box = new Coordinate(cursor.x + 2, cursor.y);
    component.level.tiles[box.y][box.x] = Tile.box;

    component.moveToClick('box', box.x, box.y);
    tick(400);
    expect(component.level.cursor).toEqual(new Coordinate(cursor.x + 1, cursor.y));
    expect(component.level.tiles[box.y][box.x]).toBe(Tile.box);
  }));

  it('should move the cursor to the clicked target, if a path was found', fakeAsync(() => {
    const serialized = `####
#   #
#   #
#@  #
####`;
    component.level = levelService.loadLevel(serialized, 'Test');
    spyOn(pathFinderService, 'findPath').and.returnValue([new Coordinate(2, 1), new Coordinate(1, 1)]);
    spyOn(component, 'walkAlongPath').and.callThrough();
    component.moveToClick('floor', 1, 1);
    tick(400);
    expect(component.walkAlongPath).toHaveBeenCalled();
    expect(component.level.cursor).toEqual(new Coordinate(1, 1));
    expect(pathFinderService.findPath).toHaveBeenCalled();
  }));

  it('should not move the cursor to the clicked target, if no path was found', fakeAsync(() => {
    const cursor = component.level.cursor;
    spyOn(pathFinderService, 'findPath').and.returnValue([]);
    component.moveToClick('floor', 1, 1);
    tick(200);
    expect(component.level.cursor).toEqual(cursor);
    expect(pathFinderService.findPath).toHaveBeenCalled();
  }));

  it('should move the cursor to the new target, if clicked again', fakeAsync(() => {
    const serialized = `####
#   #
#   #
#@  #
####`;
    component.level = levelService.loadLevel(serialized, 'Test');

    component.moveToClick('floor', 1, 1);
    tick(100);
    component.moveToClick('floor', 3, 2);
    tick(600);

    expect(component.level.cursor).toEqual(new Coordinate(3, 2));
  }));

  it('should get the right direction for moving a box by click, when the cursor stands next to it', () => {
    const serialized = `####
#   #
#@. #
#   #
####`;
    component.level = levelService.loadLevel(serialized, 'Test');
    const box = new Coordinate(2, 2);
    let result = component.getBoxMoveDirection(box);
    expect(result).toBe(Direction.Right);

    component.level.cursor = new Coordinate(box.x, box.y + 1);
    result = component.getBoxMoveDirection(box);
    expect(result).toBe(Direction.Up);

    component.level.cursor = new Coordinate(box.x + 1, box.y);
    result = component.getBoxMoveDirection(box);
    expect(result).toBe(Direction.Left);

    component.level.cursor = new Coordinate(box.x, box.y - 1);
    result = component.getBoxMoveDirection(box);
    expect(result).toBe(Direction.Down);
  });

  it('should not get a direction for moving a box by click, when the cursor does not stand next to it', () => {
    const serialized = `####
#   #
# . #
#@  #
####`;
    component.level = levelService.loadLevel(serialized, 'Test');
    const box = new Coordinate(2, 2);
    let result = component.getBoxMoveDirection(box);
    expect(result).toBe(null);
  });
});