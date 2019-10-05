import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LevelComponent } from './level/level.component';
import { HighscoreComponent } from './highscore/highscore.component';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [
  { path: 'level/:level', component: LevelComponent },
  { path: 'highscore/:level', component: HighscoreComponent },
  { path: 'menu', component: MenuComponent },
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { path: '**', redirectTo: '/menu'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
