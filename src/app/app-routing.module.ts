import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameViewComponent } from './game-view/game-view.component';
import { MenuViewComponent } from './menu-view/menu-view.component';

const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', component: MenuViewComponent },
  { path: 'game', component: GameViewComponent },
  { path: '**', component: GameViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const allRoutes = [
  MenuViewComponent, GameViewComponent
]
