import { async, ComponentFixture, TestBed, tick, fakeAsync, inject } from '@angular/core/testing';
import { LevelComponent } from './level.component';
import { Direction } from '../models/direction';
import { LevelService } from '../level.service';
import { HighscoreService } from '../highscore.service';
import { RouterTestingModule } from '@angular/router/testing';
import { TileComponent } from '../tile/tile.component';
import { Coordinate } from '../models/coordinate';
import { Router, ActivatedRoute } from '@angular/router';
import { Savegame } from '../models/savegame';
import { of } from 'rxjs';

describe('LevelComponent (shallow)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [
        LevelComponent,
        TileComponent
      ],
      providers: [
        LevelService,
        HighscoreService
      ]
    })
    .compileComponents();
  }));

  it('should processs timer', () => {
    localStorage.clear();
    const levelService = new LevelService(null);
    const highscoreService = new HighscoreService();
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
    const lvl = new LevelComponent(levelService, highscoreService, null, route);
    lvl.ngOnInit();
    expect(lvl.levelTime).toBe(234000);
    expect(lvl.counter).toBe(567);
    lvl.ngOnDestroy();
  });

  it('should processs timer', fakeAsync(() => {
    localStorage.clear();
    const levelService = new LevelService(null);
    const highscoreService = new HighscoreService();
    const route = new ActivatedRoute();
    route.params = of({
      level: 0
    });
    const lvl = new LevelComponent(levelService, highscoreService, null, route);
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [
        LevelComponent,
        TileComponent
      ],
      providers: [
        LevelService,
        HighscoreService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(LevelComponent);
    component = fixture.componentInstance;
    levelService = TestBed.get(LevelService);
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
    expect(altered).toEqual({x: 0, y: -1});
    altered = component.getNextCoordinate(original, Direction.Right);
    expect(altered).toEqual({x: 1, y: 0});
    altered = component.getNextCoordinate(original, Direction.Down);
    expect(altered).toEqual({x: 0, y: 1});
    altered = component.getNextCoordinate(original, Direction.Left);
    expect(altered).toEqual({x: -1, y: 0});
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
      { input: 'ArrowRight', direction: Direction.Right },
    ];
    values.forEach(({input, direction}, _) => {
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
    const values = [ 'z', 'Z', 'Backspace' ];
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

  it('should navigate to menu', inject([Router], (router) => {
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
});
