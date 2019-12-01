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
import { ServiceWorkerService } from './services/service-worker.service';

@NgModule({
  declarations: [
    AppComponent,
    TileComponent,
    LevelComponent,
    HighscoreComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule
  ],
  providers: [ ServiceWorkerService ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private _: ServiceWorkerService) {}
}
