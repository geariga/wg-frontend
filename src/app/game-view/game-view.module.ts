import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { GameboardComponent } from './gameboard/gameboard.component';
import { PlayerPanelComponent } from './player-panel/player-panel.component';
import { BoardTileComponent } from './gameboard/board-tile/board-tile.component';
import { GameViewComponent } from './game-view.component';
import { TilePieceComponent } from './tile-piece/tile-piece.component';
import { ScoreIndicatorComponent } from './player-panel/score-indicator/score-indicator.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    BoardTileComponent,
    GameboardComponent,
    GameViewComponent,
    PlayerPanelComponent,
    ScoreIndicatorComponent,
    TilePieceComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  exports: [
    BoardTileComponent,
    GameboardComponent,
    GameViewComponent,
    PlayerPanelComponent,
    ScoreIndicatorComponent,
    TilePieceComponent
  ]
})
export class GameViewModule { }
