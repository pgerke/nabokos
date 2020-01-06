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
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { ServiceWorkerService } from './services/service-worker.service';
import { CreditsComponent } from './credits/credits.component';
import { HttpClientModule } from '@angular/common/http';
import { EditorComponent } from './editor/editor.component';
declare var Hammer: any;

export class HammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    const hammer = new Hammer(element, {
      touchAction: 'pan-x pan-y'
    });

    hammer.get('pinch').set({ enable: true });
    return hammer;
  }
}

@NgModule({
  declarations: [
    AppComponent,
    TileComponent,
    LevelComponent,
    HighscoreComponent,
    MenuComponent,
    CreditsComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule
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
