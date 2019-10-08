import { Component, OnInit } from '@angular/core';
import { HighscoreEntry } from './../models/highscore-entry';
import { Router } from '@angular/router';
import { HighscoreService } from '../services/highscore.service';
import { LevelService } from '../services/level.service';
import { Level } from '../models/level';

@Component({
  selector: 'app-highscore',
  templateUrl: './highscore.component.html',
  styleUrls: ['./highscore.component.scss']
})
export class HighscoreComponent implements OnInit {
  entries: HighscoreEntry[] = [];
  level: Level;
  private index = 0;

  constructor(private service: HighscoreService, private levelService: LevelService, private router: Router) {
    this.level = levelService.getLevel(this.index);
    this.entries = service.getLevel(this.index);
  }

  ngOnInit() {}

  next() {
    this.index = this.index === this.levelService.getLevelCount() - 1 ? 0 : this.index + 1;
    this.level = this.levelService.getLevel(this.index);
    this.entries = this.service.getLevel(this.index);
  }

  previous() {
    this.index = (!this.index ? this.levelService.getLevelCount() : this.index) - 1;
    this.level = this.levelService.getLevel(this.index);
    this.entries = this.service.getLevel(this.index);
  }

  showMenu(): void {
    this.router.navigate(['menu']);
  }
}
