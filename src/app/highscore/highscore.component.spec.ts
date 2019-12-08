import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { HighscoreComponent } from './highscore.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HighscoreService } from '../services/highscore.service';
import { LevelService } from '../services/level.service';
import { Level } from '../models/level';

describe('HighscoreComponent', () => {
  let component: HighscoreComponent;
  let fixture: ComponentFixture<HighscoreComponent>;
  let highScoreService: HighscoreService;
  let levelService: LevelService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HighscoreComponent],
      providers: [
        LevelService,
        HighscoreService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(HighscoreComponent);
    component = fixture.componentInstance;
    highScoreService = TestBed.get(HighscoreService);
    levelService = TestBed.get(LevelService);
    spyOn(levelService, 'getLevel').and.returnValue(new Level());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get next level', inject([Router], router => {
    const routerSpy = spyOn(router, 'navigate');
    component.next();
    expect(routerSpy).toHaveBeenCalledWith(['highscore', 1]);
  }));

  it('should get previous level', inject([Router], router => {
    const routerSpy = spyOn(router, 'navigate');
    component.previous();
    expect(routerSpy).toHaveBeenCalledWith(['highscore', levelService.getLevelCount() - 1]);
  }));
});
