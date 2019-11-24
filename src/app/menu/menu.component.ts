import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Savegame } from '../models/savegame';
import { Subscription } from 'rxjs';
import { LevelService } from '../services/level.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  readonly appVersion = '1.2.0';
  canContinue: boolean;
  savegame: Savegame;
  routeUrlSubscription: Subscription;
  private parent: string;
  internalMenu = [];
  get menu(): any[] {
    return this.internalMenu.filter(e => e.parent === this.parent);
  }
  get isSetMenu(): boolean {
    return this.parent !== 'menu' && this.parent !== 'newgame';
  }

  constructor(private route: ActivatedRoute, private levelService: LevelService) {}

  ngOnInit() {
    this.routeUrlSubscription = this.route.url.subscribe(value => {
      this.parent = value[value.length - 1].path;
    });

    const saveGameSerialized = localStorage.getItem('savegame');
    this.canContinue = saveGameSerialized !== null;

    if (this.canContinue) {
      this.savegame = JSON.parse(saveGameSerialized) as Savegame;
      this.internalMenu.push({ parent: 'menu', displayName: 'Continue', routerLink: ['/level', this.savegame.levelId, 'false'] });
    }

    this.internalMenu.push({ parent: 'menu', displayName: 'New Game', routerLink: ['/menu/newgame'] });
    this.internalMenu.push({ parent: 'menu', displayName: 'High Score', routerLink: ['/highscore/0'] });
    this.internalMenu.push({ parent: 'menu', displayName: 'Level Editor', routerLink: ['/editor'], disabled: true });
    this.internalMenu.push({ parent: 'menu', displayName: 'Credits', routerLink: ['/credits'], disabled: true });
    this.internalMenu.push({ parent: 'newgame', displayName: 'Back', routerLink: ['/menu'] });
    this.levelService.getLevelSets().sort().forEach(set => {
      this.internalMenu.push({ parent: 'newgame', displayName: set, routerLink: ['/menu/newgame', set] });
      this.internalMenu.push({ parent: set, displayName: 'Back', routerLink: ['/menu/newgame'] });
      this.levelService.getLevels(set).forEach(level => {
        this.internalMenu.push({ parent: set, displayName: level.name, routerLink: ['/level', level.id, true]});
      });
    });
  }

  ngOnDestroy() {
    this.routeUrlSubscription.unsubscribe();
    this.routeUrlSubscription = null;
  }
}
