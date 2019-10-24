import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LevelComponent } from './level/level.component';
import { HighscoreComponent } from './highscore/highscore.component';
import { MenuComponent } from './menu/menu.component';
import { EditorComponent } from './editor/editor.component';
import { CreditsComponent } from './credits/credits.component';

const routes: Routes = [
  { path: 'level/:level', component: LevelComponent },
  { path: 'highscore/:level', component: HighscoreComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'credits', component: CreditsComponent },
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { path: '**', redirectTo: '/menu' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
