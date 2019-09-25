import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LevelService } from './level.service';
import { TileComponent } from './tile/tile.component';
import { Level } from './models/level';
import { Direction } from './models/direction';
import { Coordinate } from './models/coordinate';

describe('AppComponent', () => {
  let app: AppComponent;
  let service: LevelService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        TileComponent
      ],
      providers: [
        LevelService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    service = TestBed.get(LevelService);
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
    const level = service.loadLevel(testLevelSerialized, 'Test Level');
    app.level = level;
    app.checkWin();
    expect(app.isWin).toBeFalsy();
    app.run(Direction.Left);
    expect(app.isWin).toBeTruthy();
  });

  it('should calculate next coordinate', () => {
    const original = new Coordinate(0, 0);
    let altered = app.getNextCoordinate(original, Direction.Up);
    expect(altered).toEqual({x: 0, y: -1});
    altered = app.getNextCoordinate(original, Direction.Right);
    expect(altered).toEqual({x: 1, y: 0});
    altered = app.getNextCoordinate(original, Direction.Down);
    expect(altered).toEqual({x: 0, y: 1});
    altered = app.getNextCoordinate(original, Direction.Left);
    expect(altered).toEqual({x: -1, y: 0});
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
    values.forEach(({input, direction}, _) => {
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
    const values = [ 'z', 'Z', 'Backspace' ];
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
    const testLevel = service.loadLevel(testLevelSerialized, 'Test Level');
    spyOn(service, 'getNextLevel').and.returnValue(testLevel);
    app.next();
    expect(app.level).toEqual(testLevel);
  });

  it('should get previous level from service and reset', () => {
    const testLevelSerialized = `####
#.$@#
####`;
    const testLevel = service.loadLevel(testLevelSerialized, 'Test Level');
    spyOn(service, 'getPreviousLevel').and.returnValue(testLevel);
    app.previous();
    expect(app.level).toEqual(testLevel);
  });

  it('should push box correctly', () => {
    const testLevelSerialized1 = `####
#. @#
####`;
    let testLevel = service.loadLevel(testLevelSerialized1, 'Test Level');
    app.level = testLevel;
    expect(app.pushBox(new Coordinate(2, 1), Direction.Left)).toBeFalsy();

    const testLevelSerialized2 = `####
#*$@#
####`;
    testLevel = service.loadLevel(testLevelSerialized2, 'Test Level');
    app.level = testLevel;
    expect(app.pushBox(new Coordinate(2, 1), Direction.Left)).toBeFalsy();

    const testLevelSerialized3 = `####
# *@#
####`;
    testLevel = service.loadLevel(testLevelSerialized3, 'Test Level');
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
    const testLevel = service.loadLevel(testLevelSerialized, 'Test Level');
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
    const testLevel = service.loadLevel(testLevelSerialized, 'Test Level');
    spyOn(service, 'getNextLevel').and.returnValue(testLevel);
    app.next();
    app.run(Direction.Left);
    app.undo();
    expect(app.counter).toBe(2);
    expect(app.level).toEqual(testLevel);
  });
});
