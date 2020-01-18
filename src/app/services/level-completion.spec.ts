import { LevelCompletionService } from './level-completion.service';
import { TestBed } from '@angular/core/testing';

describe('LevelCompletion', () => {
  let service: LevelCompletionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(LevelCompletionService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add entry', () => {
    service.addEntry(1);
    let serialized = localStorage.getItem('level_completion');
    expect(serialized).toBeTruthy();
    let completed: number[] = JSON.parse(serialized) as number[];
    expect(completed.length).toBe(1);
    expect(completed[0]).toBe(1);

    service.addEntry(0);
    serialized = localStorage.getItem('level_completion');
    expect(serialized).toBeTruthy();
    completed = JSON.parse(serialized) as number[];
    expect(completed.length).toBe(2);
    expect(completed[0]).toBe(0);
    expect(completed[1]).toBe(1);

    service.addEntry(1);
    serialized = localStorage.getItem('level_completion');
    expect(serialized).toBeTruthy();
    completed = JSON.parse(serialized) as number[];
    expect(completed.length).toBe(2);
    expect(completed[0]).toBe(0);
    expect(completed[1]).toBe(1);
  });

  it('should get the completed levels', () => {
    service.addEntry(0);
    service.addEntry(10);
    let completedLevels = service.getLevelCompletion();
    expect(completedLevels.length).toBe(2);

    localStorage.clear();
    completedLevels = service.getLevelCompletion();
    expect(completedLevels).toEqual([]);
  });
});
