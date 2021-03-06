import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { HighscoreComponent } from './highscore.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HighscoreService, LevelService } from '../services';
import { Level } from '../models';
import { Router } from '@angular/router';

describe('HighscoreComponent', () => {
  let component: HighscoreComponent;
  let fixture: ComponentFixture<HighscoreComponent>;
  let levelService: LevelService;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
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
    levelService = TestBed.inject(LevelService);
    spyOn(levelService, 'getLevel').and.returnValue(new Level());
    fixture.detectChanges();
  });

  it('should create', async() => {
    await expect(component).toBeTruthy();
  });

  it('should get next level', inject([Router], async (router: Router) => {
    const routerSpy = spyOn(router, 'navigate');
    await component.next();
    expect(routerSpy).toHaveBeenCalledWith(['highscore', 1]);
  }));

  it('should get previous level', inject([Router], async (router: Router) => {
    const routerSpy = spyOn(router, 'navigate');
    await component.previous();
    expect(routerSpy).toHaveBeenCalledWith(['highscore', levelService.getLevelCount() - 1]);
  }));
});
