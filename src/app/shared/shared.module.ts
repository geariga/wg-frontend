import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../shared/services/game-state/game-state.service';
import { LocalStorageService } from './services/local-storage/local-storage.service';
import { SocketService } from './services/socket/socket.service';
import { GameService } from './services/game/game.service';
import { FocusInputDirective } from '../directives/focus-input.directive';

@NgModule({
  declarations: [
    FocusInputDirective
  ],
  imports: [
    CommonModule
  ],
  providers: [
    GameStateService,
    GameService,
    LocalStorageService,
    SocketService
  ],
  exports: [
    FocusInputDirective
  ]
})
export class SharedModule { }
