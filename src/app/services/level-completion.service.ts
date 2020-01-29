import { Injectable } from '@angular/core';
import { LevelService } from './level.service';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class LevelCompletionService {
  constructor(
    private levelService: LevelService,
    private sanitizer: DomSanitizer) { }

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

  getSetCompletion(setName: string): SafeStyle {
    const completedLevels = this.getLevelCompletion();
    let completedLevelCount = 0;
    const setLevels = this.levelService.getLevels(setName);
    setLevels.forEach(level => {
      completedLevelCount = completedLevels.includes(level.id) ? completedLevelCount + 1 : completedLevelCount;
    });
    const percent = Math.round(completedLevelCount / setLevels.length * 100);
    return this.sanitizer.bypassSecurityTrustStyle(`linear-gradient(75deg, rgb(144, 238, 144, 0.45) ${percent}%, transparent ${percent > 0 ? percent + 2 : 0}%)`);
  }
}
