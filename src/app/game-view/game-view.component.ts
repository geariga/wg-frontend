import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { UPDATE_STATE_FROM_CLIENT } from '../constants';
import { GameStateService } from '../shared/services/game-state/game-state.service';
import { SocketService } from '../shared/services/socket/socket.service';

@Component({
  selector: 'app-game-view',
  templateUrl: './game-view.component.html',
  styleUrls: ['game-view.component.css']
})
export class GameViewComponent implements OnInit, AfterViewInit {

  @ViewChild('container') parent!: ElementRef;

  public currentPlayersTurn!: string | null;
  public thisPlayerId!: string | undefined;
  public isTileSelected = false;

  constructor(
    private _renderer: Renderer2,
    public gameStateService: GameStateService
  ) { }

  ngOnInit(): void {
    this.gameStateService.playerTurn$.subscribe(playerTurn => this.currentPlayersTurn = playerTurn);
    this.gameStateService.thisPlayersId$.subscribe(playerId => this.thisPlayerId = playerId);
  }

  ngAfterViewInit(): void {
    this.fadeViewIn();
  }

  private fadeViewIn() {
    let opacity = 0;
    this._renderer.setStyle(this.parent.nativeElement, 'opacity', opacity);
    const interval = setInterval(() => {
      if (opacity === 1) {
        clearInterval(interval);
      }
      opacity += 0.1;
      opacity = parseFloat(opacity.toFixed(1));
      this._renderer.setStyle(this.parent.nativeElement, 'opacity', opacity);
    }, 15);
  }

  public deselectTilesOnClickElsewhere(evt: Event) {
    const target = evt.target as Element;
    let currentTiles;
    // If a tile piece wasn't the click target
    if (!target.classList.contains('letter-tile')) {
      currentTiles = this.gameStateService.localState.tiles;
      currentTiles.forEach(tile => tile.selected = false);
    }
  }

  public onStartGame() {
    // Set gameStarted state to "true"
    this.gameStateService.setGameStarted(true);
  }

}
