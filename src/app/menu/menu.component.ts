import { Component, OnInit } from '@angular/core';
import { Savegame } from '../models';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  readonly appVersion = '1.2.0';
  canContinue: boolean;
  savegame: Savegame;
  constructor() {
    const saveGameSerialized = localStorage.getItem('savegame');
    if (!saveGameSerialized) {
      this.canContinue = false;
      return;
    }

    this.canContinue = true;
    this.savegame = JSON.parse(saveGameSerialized) as Savegame;
  }

  ngOnInit() { }
}
