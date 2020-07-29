import { async, ComponentFixture, TestBed, tick, fakeAsync, inject } from '@angular/core/testing';
import { LevelComponent } from './level.component';
import { Direction, Savegame, Coordinate, Tile } from '../models';
import { LevelService, HighscoreService, PathFinderService, LevelCompletionService } from '../services';
import { RouterTestingModule } from '@angular/router/testing';
import { TileComponent } from '../tile/tile.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

describe('LevelComponent (shallow)', () => {
  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        LevelComponent,
        TileComponent
      ],
      providers: [
        RouterTestingModule,
        LevelService,
        HighscoreService,
        PathFinderService
      ]
    })
      .compileComponents();
  }));

  it('should recognize quicksave', inject([DomSanitizer], async (domSanitizer: DomSanitizer) => {
    localStorage.clear();
    const levelService = new LevelService(null);
    const highscoreService = new HighscoreService();
    const pathFinderService = new PathFinderService();
    const levelCompletionService = new LevelCompletionService(levelService, domSanitizer);
    const route = new ActivatedRoute();
    route.params = of({
      level: 123,
      newGame: 'true'
    });
    const lvl = new LevelComponent(levelService, highscoreService, null, route, pathFinderService, levelCompletionService);
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized);
    const savegame: Savegame = {
      history: [],
      level: testLevel,
      levelId: 123,
      levelTime: 456000,
      moves: 789,
      isWin: false
    };
    localStorage.setItem('quicksave', JSON.stringify(savegame));
    await expect(lvl.hasQuicksave).toBeFalsy();
    lvl.ngOnInit();
    await expect(lvl.hasQuicksave).toBeTruthy();
  }));

  it('should get corrent quicksave name', inject([DomSanitizer], async (domSanitizer: DomSanitizer) => {
    localStorage.clear();
    const levelService = new LevelService(null);
    const highscoreService = new HighscoreService();
    const pathFinderService = new PathFinderService();
    const levelCompletionService = new LevelCompletionService(levelService, domSanitizer);

    const route = new ActivatedRoute();
    route.params = of({
      level: 0,
      newGame: 'true'
    });
    const lvl = new LevelComponent(levelService, highscoreService, null, route, pathFinderService, levelCompletionService);
    (lvl as unknown as { levelId: number }).levelId = 123;
    (lvl as unknown as { allowMultipleQuickSaves: boolean }).allowMultipleQuickSaves = false;
    await expect((lvl as unknown as { getQuickSaveName(): string }).getQuickSaveName()).toBe('quicksave');
    (lvl as unknown as { allowMultipleQuickSaves: boolean }).allowMultipleQuickSaves = true;
    await expect((lvl as unknown as { getQuickSaveName(): string }).getQuickSaveName()).toBe('quicksave123');
  }));

  it('should processs timer', inject([DomSanitizer], async (domSanitizer: DomSanitizer) => {
    localStorage.clear();
    const levelService = new LevelService(null);
    const highscoreService = new HighscoreService();
    const pathFinderService = new PathFinderService();
    const levelCompletionService = new LevelCompletionService(levelService, domSanitizer);
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized);
    const savegame: Savegame = {
      history: [],
      level: testLevel,
      levelId: 1,
      levelTime: 234000,
      moves: 567,
      isWin: false
    };
    localStorage.setItem('savegame', JSON.stringify(savegame));
    const route = new ActivatedRoute();
    route.params = of({
      level: 1,
      newGame: 'false'
    });
    const lvl = new LevelComponent(levelService, highscoreService, null, route, pathFinderService, levelCompletionService);
    lvl.ngOnInit();
    await expect(lvl.levelTime).toBe(234000);
    await expect(lvl.counter).toBe(567);
    lvl.ngOnDestroy();
  }));

  it('should processs timer and continue counting', fakeAsync(inject([DomSanitizer], async (domSanitizer: DomSanitizer) => {
    localStorage.clear();
    const levelService = new LevelService(null);
    const highscoreService = new HighscoreService();
    const pathFinderService = new PathFinderService();
    const levelCompletionService = new LevelCompletionService(levelService, domSanitizer);
    const route = new ActivatedRoute();
    route.params = of({
      level: 0,
      newGame: 'true'
    });
    const lvl = new LevelComponent(levelService, highscoreService, null, route, pathFinderService, levelCompletionService);
    lvl.ngOnInit();
    await expect(lvl.levelTimerSubscription).toBeDefined();
    await expect(lvl.levelStarted).toBeFalsy();
    await expect(lvl.levelTime).toBe(0);
    tick(2500);
    await expect(lvl.levelStarted).toBeFalsy();
    await expect(lvl.levelTime).toBe(0);
    lvl.run(Direction.Left);
    await expect(lvl.levelStarted).toBeTruthy();
    tick(2500);
    await expect(lvl.levelTime).toBeGreaterThan(2500);
    lvl.ngOnDestroy();
  })));
});

describe('LevelComponent', () => {
  let component: LevelComponent;
  let fixture: ComponentFixture<LevelComponent>;
  let levelService: LevelService;
  let pathFinderService: PathFinderService;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
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
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(LevelComponent);
    component = fixture.componentInstance;
    levelService = TestBed.inject(LevelService);
    pathFinderService = TestBed.inject(PathFinderService);
    fixture.detectChanges();
  });

  it('should create', async () => {
    await expect(component).toBeTruthy();
  });

  it('should check win', async () => {
    const testLevelSerialized = `####
#.$@#
####`;
    const level = levelService.loadLevel(testLevelSerialized);
    component.level = level;
    component.checkWin();
    await expect(component.isWin).toBeFalsy();
    component.run(Direction.Left);
    await expect(component.isWin).toBeTruthy();
  });

  it('should calculate next coordinate', async () => {
    const original = new Coordinate(0, 0);
    let altered = component.getNextCoordinate(original, Direction.Up);
    await expect(altered).toEqual(new Coordinate(0, -1));
    altered = component.getNextCoordinate(original, Direction.Right);
    await expect(altered).toEqual(new Coordinate(1, 0));
    altered = component.getNextCoordinate(original, Direction.Down);
    await expect(altered).toEqual(new Coordinate(0, 1));
    altered = component.getNextCoordinate(original, Direction.Left);
    await expect(altered).toEqual(new Coordinate(-1, 0));
  });

  it('should process direction keyboard events', async () => {
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
    values.forEach(({ input, direction }) => {
      component.keyEvent(new KeyboardEvent('keyup', { key: input }));
      void expect(undoSpy).not.toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalledWith(direction);
      runSpy.calls.reset();
    });

    component.keyEvent(new KeyboardEvent('keyup', { key: 'x' }));
    await expect(undoSpy).not.toHaveBeenCalled();
    await expect(runSpy).not.toHaveBeenCalled();
  });

  it('should process undo keyboard events', () => {
    const undoSpy = spyOn(component, 'undo');
    const runSpy = spyOn(component, 'run');
    const values = ['z', 'Z', 'Backspace'];
    values.forEach((input, x) => {
      component.keyEvent(new KeyboardEvent('keyup', { key: input }));
      void expect(undoSpy).toHaveBeenCalledTimes(x + 1);
      void expect(runSpy).not.toHaveBeenCalled();
    });
  });

  it('should process zoom in keyboard events', () => {
    const onPinchSpy = spyOn(component, 'onPinch');
    const runSpy = spyOn(component, 'run');
    const values = ['i', 'I', '+'];
    values.forEach((input, x) => {
      component.keyEvent(new KeyboardEvent('keyup', { key: input }));
      void expect(onPinchSpy).toHaveBeenCalledTimes(x + 1);
      expect(onPinchSpy).toHaveBeenCalledWith('IN', 10);
      void expect(runSpy).not.toHaveBeenCalled();
    });
  });

  it('should process zoom out keyboard events', () => {
    const onPinchSpy = spyOn(component, 'onPinch');
    const runSpy = spyOn(component, 'run');
    const values = ['o', 'O', '-'];
    values.forEach((input, x) => {
      component.keyEvent(new KeyboardEvent('keyup', { key: input }));
      void expect(onPinchSpy).toHaveBeenCalledTimes(x + 1);
      expect(onPinchSpy).toHaveBeenCalledWith('OUT', 10);
      void expect(runSpy).not.toHaveBeenCalled();
    });
  });

  it('should request next level from service', inject([Router], async (router: Router) => {
    const levelServiceSpy = spyOn(levelService, 'getNextLevel');
    const routerSpy = spyOn(router, 'navigate');
    component.next();
    await expect(levelServiceSpy).toHaveBeenCalled();
    await expect(routerSpy).toHaveBeenCalled();
  }));

  it('should request previous level from service', inject([Router], async (router: Router) => {
    const levelServiceSpy = spyOn(levelService, 'getPreviousLevel');
    const routerSpy = spyOn(router, 'navigate');
    component.previous();
    await expect(levelServiceSpy).toHaveBeenCalled();
    await expect(routerSpy).toHaveBeenCalled();
  }));

  it('should push box correctly', async () => {
    const testLevelSerialized1 = `####
#. @#
####`;
    let testLevel = levelService.loadLevel(testLevelSerialized1);
    component.level = testLevel;
    await expect(component.pushBox(new Coordinate(2, 1), Direction.Left)).toBeFalsy();

    const testLevelSerialized2 = `####
#*$@#
####`;
    testLevel = levelService.loadLevel(testLevelSerialized2);
    component.level = testLevel;
    await expect(component.pushBox(new Coordinate(2, 1), Direction.Left)).toBeFalsy();

    const testLevelSerialized3 = `####
# *@#
####`;
    testLevel = levelService.loadLevel(testLevelSerialized3);
    component.level = testLevel;
    await expect(component.pushBox(new Coordinate(2, 1), Direction.Left)).toBeTruthy();
  });

  it('should not run if cannot move or push box', async () => {
    spyOn(component, 'moveCursor').and.returnValue(false);
    spyOn(component, 'pushBox').and.returnValue(false);
    const spy = spyOn(component, 'saveHistory');
    component.run(Direction.Left);
    await expect(spy).not.toHaveBeenCalled();
  });

  it('should save the history', async () => {
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized);
    let i = 0;
    while (i++ < 1000) {
      component.saveHistory(testLevel);
      await expect(component.history.length).toBe(i);
    }
    component.saveHistory(testLevel);
    await expect(component.history.length).toBe(1000);
  });

  it('should undo', async () => {
    component.undo();
    await expect(component.counter).toBe(0);
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized);
    component.level = testLevel;
    component.run(Direction.Left);
    component.undo();
    await expect(component.counter).toBe(2);
    await expect(component.level.serialized).toEqual(testLevelSerialized);
  });

  it('should navigate to menu', inject([Router], async router => {
    localStorage.clear();
    const saveSpy = spyOn(component, 'createSaveGame');
    const routerSpy = spyOn(router, 'navigate');
    const localStorageSpy = spyOn(localStorage, 'setItem').and.callFake((key) => {
      void expect(key).toBe('savegame');
    });

    component.showMenu();
    await expect(saveSpy).toHaveBeenCalled();
    await expect(localStorageSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['menu']);
  }));

  it('should quickload', async () => {
    // should return false, if localStorage has no 'quicksave' key
    await expect(component.quickLoad()).toBeFalsy();

    // should return false, if the levelId in the saveGame does not equal the current level
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized);
    const savegame: Savegame = {
      history: [],
      level: testLevel,
      levelId: 123,
      levelTime: 456000,
      moves: 789,
      isWin: false
    };
    localStorage.setItem('quicksave', JSON.stringify(savegame));
    await expect(component.quickLoad()).toBeFalsy();

    // should load the saved game and return true
    component.levelId = 0;
    savegame.levelId = component.levelId;
    localStorage.setItem('quicksave', JSON.stringify(savegame));
    await expect(component.quickLoad()).toBeTruthy();
    await expect(component.levelTime).toBe(savegame.levelTime);
  });

  it('should quicksave', async () => {
    localStorage.clear();
    await expect(component.hasQuicksave).toBeFalsy();
    const saveSpy = spyOn(component, 'createSaveGame');
    const localStorageSpy = spyOn(localStorage, 'setItem').and.callFake((key) => {
      void expect(key).toBe('quicksave');
    });
    component.quickSave();
    await expect(saveSpy).toHaveBeenCalled();
    await expect(localStorageSpy).toHaveBeenCalled();
    await expect(component.hasQuicksave).toBeTruthy();
  });

  it('should create savegame', async () => {
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized);
    component.level = testLevel;
    component.levelId = 123;
    component.levelTime = 456000;
    component.counter = 789;
    const savegame = component.createSaveGame();
    await expect(savegame.levelId).toBe(component.levelId);
    await expect(savegame.moves).toBe(component.counter);
    await expect(savegame.levelTime).toBe(component.levelTime);
    await expect(savegame.history).toEqual(component.history);
  });

  it('should load savegame', async () => {
    // should return false, if localStorage has no 'savegame' key
    await expect(component.loadSaveGame()).toBeFalsy();

    // should return false, if the levelId in the saveGame does not equal the current level
    const testLevelSerialized = `####
#  @#
####`;
    const testLevel = levelService.loadLevel(testLevelSerialized);
    const savegame: Savegame = {
      history: [],
      level: testLevel,
      levelId: 123,
      levelTime: 456000,
      moves: 789,
      isWin: false
    };
    localStorage.setItem('savegame', JSON.stringify(savegame));
    await expect(component.loadSaveGame()).toBeFalsy();

    // should load the saved game and return true
    component.levelId = 0;
    savegame.levelId = component.levelId;
    localStorage.setItem('savegame', JSON.stringify(savegame));
    await expect(component.loadSaveGame()).toBeTruthy();
    await expect(component.levelTime).toBe(savegame.levelTime);
  });

  it('should do nothing on click, when the clicked element is a wall', fakeAsync(async () => {
    const cursor = component.level.cursor;
    await component.moveToClick('wall', cursor.x + 1, cursor.y);
    tick(200);
    await expect(component.level.cursor).toBe(cursor);
  }));

  it('should move the cursor and box, when the cursor is next to a box and the box is clicked', fakeAsync(async () => {
    const cursor = component.level.cursor;
    const box = new Coordinate(cursor.x + 1, cursor.y);
    component.level.tiles[box.y][box.x] = Tile.box;

    const spyRun = spyOn(component, 'run');
    spyRun.and.callThrough();

    await component.moveToClick('box', box.x, box.y);
    tick(400);
    await expect(component.level.cursor).toEqual(box);
    await expect(component.level.tiles[box.y][box.x + 1]).toBe(Tile.box);
    await expect(spyRun).toHaveBeenCalled();

    component.level.tiles[box.y][box.x + 1] = Tile.targetWithBox;
    component.level.cursor = cursor;
    spyRun.and.callThrough();

    await component.moveToClick('targetWithBox', box.x, box.y);
    tick(400);
    await expect(component.level.cursor).toEqual(box);
    await expect(component.level.tiles[box.y][box.x + 1]).toBe(Tile.targetWithBox);
    await expect(spyRun).toHaveBeenCalled();
  }));

  it('should only move the cursor not the box, when the cursor is not next to a box and the box is clicked', async () => {
    const serialized = `####
  #   #
  #   #
  #@  #
  ####`;
    component.level = levelService.loadLevel(serialized);
    const cursor = component.level.cursor;
    const box = new Coordinate(cursor.x + 2, cursor.y);
    component.level.tiles[box.y][box.x] = Tile.box;

    await component.moveToClick('box', box.x, box.y);
    await expect(component.level.cursor).toEqual(new Coordinate(cursor.x + 1, cursor.y));
    await expect(component.level.tiles[box.y][box.x]).toBe(Tile.box);
  });

  it('should move the cursor to the clicked target, if a path was found', async () => {
    const serialized = `####
#   #
#   #
#@  #
####`;
    component.level = levelService.loadLevel(serialized);
    const findSpy = spyOn(pathFinderService, 'findPath').and.returnValue([new Coordinate(2, 1), new Coordinate(1, 1)]);
    const walkSpy = spyOn(component, 'walkAlongPath').and.callThrough();
    await component.moveToClick('floor', 1, 1);

    await expect(walkSpy).toHaveBeenCalled();
    await expect(component.level.cursor).toEqual(new Coordinate(1, 1));
    await expect(findSpy).toHaveBeenCalled();
  });

  it('should not move the cursor to the clicked target, if no path was found', async () => {
    const cursor = component.level.cursor;
    const findSpy = spyOn(pathFinderService, 'findPath').and.returnValue([]);
    await component.moveToClick('floor', 1, 1);

    await expect(component.level.cursor).toEqual(cursor);
    await expect(findSpy).toHaveBeenCalled();
  });

  it('should move the cursor to the new target, if clicked again', async () => {
    const serialized = `####
#   #
#   #
#@  #
####`;
    component.level = levelService.loadLevel(serialized);
    component.moveToClick('floor', 1, 1).catch(() => {
      fail('should not fail to move');
    });
    await component.moveToClick('floor', 3, 2);

    await expect(component.level.cursor).toEqual(new Coordinate(3, 2));
  });

  it('should get the right direction for moving a box by click, when the cursor stands next to it', async () => {
    const serialized = `####
#   #
#@. #
#   #
####`;
    component.level = levelService.loadLevel(serialized);
    const box = new Coordinate(2, 2);
    let result = component.getBoxMoveDirection(box);
    await expect(result).toBe(Direction.Right);

    component.level.cursor = new Coordinate(box.x, box.y + 1);
    result = component.getBoxMoveDirection(box);
    await expect(result).toBe(Direction.Up);

    component.level.cursor = new Coordinate(box.x + 1, box.y);
    result = component.getBoxMoveDirection(box);
    await expect(result).toBe(Direction.Left);

    component.level.cursor = new Coordinate(box.x, box.y - 1);
    result = component.getBoxMoveDirection(box);
    await expect(result).toBe(Direction.Down);
  });

  it('should not get a direction for moving a box by click, when the cursor does not stand next to it', async () => {
    const serialized = `####
#   #
# . #
#@  #
####`;
    component.level = levelService.loadLevel(serialized);
    const box = new Coordinate(2, 2);
    const result = component.getBoxMoveDirection(box);
    await expect(result).toBe(null);
  });

  it('should get the correct width of the level', async () => {
    const serialized = `####
#   #
# .  #
#@  #
####`;
    component.level = levelService.loadLevel(serialized);
    const setSpy = spyOn(component, 'setContentAlignment').and.callThrough();
    component.setContentWidth();
    await expect(component.contentWidth).toBe(6 * 50);
    await expect(setSpy).toHaveBeenCalled();
  });

  it('should increase the scale value on zoom in', async () => {
    const setSpy = spyOn(component, 'setContentWidth');
    component.onPinch('IN');
    await expect(component.scaleValue).toBe(101);
    await expect(setSpy).toHaveBeenCalled();
  });

  it('should reduce the scale value on zoom out', async () => {
    const setSpy = spyOn(component, 'setContentWidth');
    component.onPinch('OUT');
    await expect(component.scaleValue).toBe(99);
    await expect(setSpy).toHaveBeenCalled();
  });

  it('should not reduce the scale value on zoom out, when the new value would be zero', async () => {
    const setSpy = spyOn(component, 'setContentWidth');
    component.scaleValue = 1;
    component.onPinch('OUT');
    await expect(component.scaleValue).toBe(1);
    await expect(setSpy).toHaveBeenCalled();
  });

  it('should prevent the default event, when two fingers are touching the screen', async () => {
    const event = {
      touches: [ 'first', 'second' ],
      preventDefault: (): void => { }
    };
    spyOn(event, 'preventDefault');
    component.preventDefaultZoomEvent(event);
    await expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not prevent the default event, when only one finger is touching the screen', async () => {
    const event = {
      touches: [ 'first' ],
      preventDefault: (): void => { }
    };
    spyOn(event, 'preventDefault');
    component.preventDefaultZoomEvent(event);
    await expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
