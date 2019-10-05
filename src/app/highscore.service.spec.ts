import { TestBed } from '@angular/core/testing';
import { HighscoreService } from './highscore.service';
import { HighscoreEntry } from './models/highscore-entry';

describe('HighscoreService', () => {
  let service: HighscoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(HighscoreService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add entry', () => {
    const entry1: HighscoreEntry = {
      name: 'Test',
      moves: 123,
      levelTime: 456000
    };
    const entry2: HighscoreEntry = {
      name: 'Test',
      moves: 78,
      levelTime: 90000
    };

    // Add first highscore entry and verify correct setup
    service.addEntry(0, entry1);
    let serialized = localStorage.getItem('highscore_0');
    expect(serialized).toBeTruthy();
    let scores: HighscoreEntry[] = JSON.parse(serialized) as HighscoreEntry[];
    expect(scores.length).toBe(1);
    expect(scores[0]).toEqual(entry1);

    // Add an additional entry and verify correct order
    service.addEntry(0, entry2);
    serialized = localStorage.getItem('highscore_0');
    expect(serialized).toBeTruthy();
    scores = JSON.parse(serialized) as HighscoreEntry[];
    expect(scores.length).toBe(2);
    expect(scores[0]).toEqual(entry2);
    expect(scores[1]).toEqual(entry1);
  });

  it('should get highscore for level', () => {
    const entry1: HighscoreEntry = {
      name: 'Test',
      moves: 123,
      levelTime: 456000
    };
    service.addEntry(0, entry1);
    const scores = service.getLevel(0);
    expect(scores.length).toBe(1);
    expect(scores[0]).toEqual(entry1);
    expect(service.getLevel(1)).toEqual([]);
  });
});
