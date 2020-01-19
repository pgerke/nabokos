import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LevelCompletionService {
  constructor() { }

  addEntry(levelId: number): void {
    const entries = this.getLevelCompletion();
    if (entries.includes(levelId)) {
      return;
    }
    entries.push(levelId);
    localStorage.setItem('level_completion', JSON.stringify(entries.sort((a, b) => a - b)));
  }

  getLevelCompletion(): number[] {
    const completedLevels = localStorage.getItem('level_completion');
    return completedLevels ? (JSON.parse(completedLevels) as number[]) : [];
  }
}
