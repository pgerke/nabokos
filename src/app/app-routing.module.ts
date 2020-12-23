import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LevelComponent } from './level/level.component';
import { HighscoreComponent } from './highscore/highscore.component';
import { MenuComponent } from './menu/menu.component';
import { CreditsComponent } from './credits/credits.component';

const routes: Routes = [
  { path: 'level/:level/:newGame', component: LevelComponent },
  { path: 'highscore/:level', component: HighscoreComponent },
  { path: 'menu/newgame/:setName', component: MenuComponent },
  { path: 'menu/newgame', component: MenuComponent },
  { path: 'menu/highscore/:setName', component: MenuComponent },
  { path: 'menu/highscore', component: MenuComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'credits', component: CreditsComponent },
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { path: '**', redirectTo: '/menu' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
