import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Savegame } from '../models/savegame';

describe('MenuComponent with save game', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ MenuComponent ]
    })
    .compileComponents();
  }));

  it('should recognize savegame and allow player to continue', inject([Router], (router) => {
    const spy = spyOn(router, 'navigate');
    const savegame: Savegame = {
      moves: 123,
      levelTime: 456000,
      levelId: 789,
      level: undefined,
      history: []
    };
    localStorage.setItem('savegame', JSON.stringify(savegame));
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.canContinue).toBeTruthy();
    component.continueGame();
    expect(spy).toHaveBeenCalledWith(['level', savegame.levelId]);
  }));
});

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ MenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.canContinue).toBeFalsy();
  });

  it('should start new game', inject([Router], (router) => {
    const spy = spyOn(router, 'navigate');
    component.newGame();
    expect(spy).toHaveBeenCalledWith(['level', 0]);
  }));

  it('should show credits', inject([Router], (router) => {
    const spy = spyOn(router, 'navigate');
    component.showCredits();
    expect(spy).toHaveBeenCalledWith(['credits']);
  }));

  it('should show highscore', inject([Router], (router) => {
    const spy = spyOn(router, 'navigate');
    component.showHighScore();
    expect(spy).toHaveBeenCalledWith(['highscore', 0]);
  }));

  it('should show level editor', inject([Router], (router) => {
    const spy = spyOn(router, 'navigate');
    component.showLevelEditor();
    expect(spy).toHaveBeenCalledWith(['editor']);
  }));
});
