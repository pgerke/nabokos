import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { TileComponent } from './tile/tile.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LevelComponent } from './level/level.component';
import { AppRoutingModule } from './app-routing.module';
import { HighscoreComponent } from './highscore/highscore.component';
import { MenuComponent } from './menu/menu.component';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
import { ServiceWorkerService } from './services/service-worker.service';
import { CreditsComponent } from './credits/credits.component';
import { HttpClientModule } from '@angular/common/http';
import * as Hammer from 'hammerjs';

export class HammerConfig extends HammerGestureConfig {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  buildHammer(element: HTMLElement): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return new Hammer(element, {
      touchAction: 'pan-x pan-y',
      recognizers: [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        [ Hammer.Pinch, { enable: true } ]
      ]
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    TileComponent,
    LevelComponent,
    HighscoreComponent,
    MenuComponent,
    CreditsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule,
    HammerModule
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    },
    ServiceWorkerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private _: ServiceWorkerService) { }
}
