import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Savegame } from '../models';
import { Subscription } from 'rxjs';
import { LevelService, ServiceWorkerService } from '../services';
import { version } from '../../../package.json';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  readonly appVersion: string = version;
  canContinue: boolean;
  hasUpdate: boolean;
  savegame: Savegame;
  routeUrlSubscription: Subscription;
  updateSubscription: Subscription;
  private parent: string;
  internalMenu = [];
  get menu(): any[] {
    return this.internalMenu.filter(e => e.parent === this.parent);
  }
  get isSetMenu(): boolean {
    return this.parent.startsWith('ng_') || this.parent.startsWith('hs_'); // this.parent !== 'menu' && this.parent !== 'newgame';
  }

  constructor(
    private route: ActivatedRoute,
    private levelService: LevelService,
    public serviceWorkerService: ServiceWorkerService) { }

  ngOnInit() {
    if (this.serviceWorkerService.isEnabled) {
      this.updateSubscription = this.serviceWorkerService.available.subscribe(e => this.hasUpdate = e.available !== null);
    }

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
    this.internalMenu.push({ parent: 'menu', displayName: 'High Score', routerLink: ['/menu/highscore'] });
    this.internalMenu.push({ parent: 'menu', displayName: 'Level Editor', routerLink: ['/editor'] });
    this.internalMenu.push({ parent: 'menu', displayName: 'Credits', routerLink: ['/credits'] });
    this.internalMenu.push({ parent: 'newgame', displayName: 'Back', routerLink: ['/menu'] });
    this.internalMenu.push({ parent: 'highscore', displayName: 'Back', routerLink: ['/menu'] });
    this.levelService.getLevelSets().sort().forEach(set => {
      // Push menu items for new game
      this.internalMenu.push({ parent: 'newgame', displayName: set, routerLink: ['/menu/newgame', 'ng_' + set] });
      this.internalMenu.push({ parent: 'ng_' + set, displayName: 'Back', routerLink: ['/menu/newgame'] });
      this.levelService.getLevels(set).forEach(level => {
        this.internalMenu.push({ parent: 'ng_' + set, displayName: level.name, routerLink: ['/level', level.id, true] });
      });

      // Push menu items for high score
      this.internalMenu.push({ parent: 'highscore', displayName: set, routerLink: ['/menu/highscore', 'hs_' + set] });
      this.internalMenu.push({ parent: 'hs_' + set, displayName: 'Back', routerLink: ['/menu/highscore'] });
      this.levelService.getLevels(set).forEach(level => {
        this.internalMenu.push({ parent: 'hs_' + set, displayName: level.name, routerLink: ['/highscore', level.id] });
      });
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }

    this.routeUrlSubscription.unsubscribe();
    this.routeUrlSubscription = null;
  }

  async applyUpdate() {
    await this.serviceWorkerService.activateUpdate();
  }

  async checkUpdate() {
    await this.serviceWorkerService.checkForUpdate();
  }
}
