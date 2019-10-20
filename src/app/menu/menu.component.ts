import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Savegame } from '../models/savegame';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  readonly appVersion = '1.1.0';
  canContinue: boolean;
  private savegame: Savegame;
  constructor(private router: Router) {
    const saveGameSerialized = localStorage.getItem('savegame');
    if (!saveGameSerialized) {
      this.canContinue = false;
      return;
    }

    this.canContinue = true;
    this.savegame = JSON.parse(saveGameSerialized) as Savegame;
  }

  ngOnInit() { }

  continueGame(): void {
    this.router.navigate(['level', this.savegame.levelId, false]);
  }

  newGame(): void {
    this.router.navigate(['level', 0, true]);
  }

  showCredits(): void {
    this.router.navigate(['credits']);
  }

  showHighScore(): void {
    this.router.navigate(['highscore', 0]);
  }

  showLevelEditor(): void {
    this.router.navigate(['editor']);
  }
}
