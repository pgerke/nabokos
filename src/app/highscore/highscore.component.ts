import { Component, OnInit, OnDestroy } from '@angular/core';
import { HighscoreEntry } from './../models/highscore-entry';
import { Router, ActivatedRoute } from '@angular/router';
import { HighscoreService } from '../services/highscore.service';
import { LevelService } from '../services/level.service';
import { Level } from '../models/level';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-highscore',
  templateUrl: './highscore.component.html',
  styleUrls: ['./highscore.component.scss']
})
export class HighscoreComponent implements OnInit, OnDestroy {
  entries: HighscoreEntry[] = [];
  level: Level;
  routeParameterSubscription: Subscription;
  private index = 0;

  constructor(
    private service: HighscoreService,
    private levelService: LevelService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.routeParameterSubscription = this.route.paramMap.subscribe(value => {
      this.index = Number.parseInt(value.get('level'), 10);
      console.log('Level: ' + this.index);
      this.level = this.levelService.getLevel(this.index);
      this.entries = this.service.getLevel(this.index);
    });
  }

  ngOnDestroy() {
    this.routeParameterSubscription.unsubscribe();
    this.routeParameterSubscription = null;
  }

  next() {
    this.router.navigate(['highscore', this.levelService.getNextLevel()]);
  }

  previous() {
    this.router.navigate(['highscore', this.levelService.getPreviousLevel()]);
  }
}
