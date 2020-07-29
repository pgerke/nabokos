import { Injectable } from '@angular/core';
import { HighscoreEntry } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HighscoreService {
  constructor() { }

  addEntry(index: number, entry: HighscoreEntry): void {
    const entries = this.getLevel(index);
    entries.push(entry);
    localStorage.setItem(`highscore_${index}`, JSON.stringify(entries.sort((a, b) => a.moves - b.moves)));
  }

  getLevel(index: number): HighscoreEntry[] {
    const scores = localStorage.getItem(`highscore_${index}`);
    return scores ? (JSON.parse(scores) as HighscoreEntry[]) : [];
  }
}
