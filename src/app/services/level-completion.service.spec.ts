import { LevelCompletionService } from './level-completion.service';
import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { LevelService } from './level.service';
import { Level } from '../models';

describe('LevelCompletion', () => {
  let service: LevelCompletionService;
  let levelService: LevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.inject(LevelCompletionService);
    levelService = TestBed.inject(LevelService);
    localStorage.clear();
  });

  it('should be created', async () => {
    await expect(service).toBeTruthy();
  });

  it('should add entry', async () => {
    service.addEntry(1);
    let serialized = localStorage.getItem('level_completion');
    await expect(serialized).toBeTruthy();
    let completed: number[] = JSON.parse(serialized) as number[];
    await expect(completed.length).toBe(1);
    await expect(completed[0]).toBe(1);

    service.addEntry(0);
    serialized = localStorage.getItem('level_completion');
    await expect(serialized).toBeTruthy();
    completed = JSON.parse(serialized) as number[];
    await expect(completed.length).toBe(2);
    await expect(completed[0]).toBe(0);
    await expect(completed[1]).toBe(1);

    service.addEntry(1);
    serialized = localStorage.getItem('level_completion');
    await expect(serialized).toBeTruthy();
    completed = JSON.parse(serialized) as number[];
    await expect(completed.length).toBe(2);
    await expect(completed[0]).toBe(0);
    await expect(completed[1]).toBe(1);
  });

  it('should get the completed levels', async () => {
    service.addEntry(0);
    service.addEntry(10);
    let completedLevels = service.getLevelCompletion();
    await expect(completedLevels.length).toBe(2);

    localStorage.clear();
    completedLevels = service.getLevelCompletion();
    await expect(completedLevels).toEqual([]);
  });

  it('should get the styling depending von the set completion', inject([DomSanitizer], async (domSanitizer: DomSanitizer) => {
    service.addEntry(0);
    service.addEntry(100); // not in sasquatch I set

    const levels = [
      { id: 0 } as Level,
      { id: 10 } as Level
    ];
    spyOn(levelService, 'getLevels').and.returnValue(levels);

    const style = service.getSetCompletion('ng_Sasquatch I');
    await expect(style).toEqual(domSanitizer
      .bypassSecurityTrustStyle('linear-gradient(75deg, rgb(144, 238, 144, 0.45) 50%, transparent 52%)'));
  }));

  it('should set the styling transparent to zero, when the set completion is zero',
    inject([DomSanitizer], async (domSanitizer: DomSanitizer) => {
      const levels = [
        { id: 0 } as Level,
        { id: 10 } as Level
      ];
      spyOn(levelService, 'getLevels').and.returnValue(levels);

      const style = service.getSetCompletion('ng_Sasquatch I');
      await expect(style).toEqual(domSanitizer
        .bypassSecurityTrustStyle('linear-gradient(75deg, rgb(144, 238, 144, 0.45) 0%, transparent 0%)'));
    }));
});
