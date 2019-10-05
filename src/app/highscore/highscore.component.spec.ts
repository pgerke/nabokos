import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { HighscoreComponent } from './highscore.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HighscoreService } from '../highscore.service';
import { LevelService } from '../level.service';
import { Level } from '../models/level';

describe('HighscoreComponent', () => {
  let component: HighscoreComponent;
  let fixture: ComponentFixture<HighscoreComponent>;
  let highScoreService: HighscoreService;
  let levelService: LevelService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ HighscoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighscoreComponent);
    component = fixture.componentInstance;
    highScoreService = TestBed.get(HighscoreService);
    levelService = TestBed.get(LevelService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to menu', inject([Router], (router) => {
    const spy = spyOn(router, 'navigate');
    component.showMenu();
    expect(spy).toHaveBeenCalledWith(['menu']);
  }));

  it('should switch levels correctly', () => {
    const highScoreServiceSpy = spyOn(highScoreService, 'getLevel').and.returnValue([]);
    const levelServiceSpy = spyOn(levelService, 'getLevel').and.returnValue(new Level());
    const levelCount = levelService.getLevelCount();

    // Simple increment
    component.next();
    expect(highScoreServiceSpy).toHaveBeenCalledWith(1);
    expect(levelServiceSpy).toHaveBeenCalledWith(1);

    // Simple decrement
    highScoreServiceSpy.calls.reset();
    levelServiceSpy.calls.reset();
    component.previous();
    expect(highScoreServiceSpy).toHaveBeenCalledWith(0);
    expect(levelServiceSpy).toHaveBeenCalledWith(0);

    // Decrement with wrap around
    highScoreServiceSpy.calls.reset();
    levelServiceSpy.calls.reset();
    component.previous();
    expect(highScoreServiceSpy).toHaveBeenCalledWith(levelCount - 1);
    expect(levelServiceSpy).toHaveBeenCalledWith(levelCount - 1);

    // Increment with wrap around
    highScoreServiceSpy.calls.reset();
    levelServiceSpy.calls.reset();
    component.next();
    expect(highScoreServiceSpy).toHaveBeenCalledWith(0);
    expect(levelServiceSpy).toHaveBeenCalledWith(0);
  });
});
