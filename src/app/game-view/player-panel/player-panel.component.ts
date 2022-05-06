import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { GameStateService } from 'src/app/shared/services/game-state/game-state.service';
import { GameService } from 'src/app/shared/services/game/game.service';
import { SocketService } from 'src/app/shared/services/socket/socket.service';
import { CurrentPlayers, TileBag, TilePiece } from 'src/app/types';
import { TilePieceComponent } from '../tile-piece/tile-piece.component';
import {
  DETERMINE_FIRST_PLAYER_EVENT,
  DRAW_TILES_EVENT,
  GAME_START_EVENT,
  START_TURN_EVENT,
  TRADE_TILES_EVENT,
  UPDATE_STATE_FROM_CLIENT
} from '../../constants';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs';

@Component({
  selector: 'app-player-panel',
  templateUrl: './player-panel.component.html',
  styleUrls: ['./player-panel.component.css']
})
export class PlayerPanelComponent implements OnInit, OnChanges {

  @ViewChildren(TilePieceComponent) tilePieces!: QueryList<TilePieceComponent>;
  @ViewChild('checkWordInput') checkWordInput!: ElementRef<HTMLInputElement>;

  @Output() startGameEvent: EventEmitter<boolean> = new EventEmitter();

  @Input() gameStarted!: boolean | null;
  @Input() gameId!: string | null;
  @Input() currentPlayers!: CurrentPlayers | null;
  @Input() tileBag!: TileBag | null;
  @Input() playerTurn!: string | null;
  @Input() thisPlayerId!: string | undefined | null;

  private WORD_API_URL = environment.socketServer;

  public currentMenu: string = 'game-controls';

  constructor(
    private _http: HttpClient,
    private _renderer: Renderer2,
    private _socket: SocketService,
    private _game: GameService,
    public gameStateService: GameStateService
  ) { }

  ngOnInit(): void {
      // Observe turn start and act accordingly if this player's turn
      this._socket.observeSocketEvent(START_TURN_EVENT).subscribe(() => {
        this.handleTurnStart();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If the game has been started
    if (changes['gameStarted'] &&
        changes['gameStarted'].previousValue === false) {

      // Draw 7 tiles for this player then determine who goes first
      this.drawStartingTiles();
      this.determineFirstPlayer();
    }
  }

  private drawStartingTiles() {
    this._socket.emitSocketEvent(GAME_START_EVENT, {
      gameId: this.gameStateService.globalState.gameId, amount: 7
    });
  }

  private determineFirstPlayer() {
    this._socket.emitSocketEvent(DETERMINE_FIRST_PLAYER_EVENT, {
      gameId: this.gameStateService.globalState.gameId
    });
  }

  private handleTurnStart() {
    if (this.checkIfThisPlayersTurn()) {
      const gameId = this.gameStateService.globalState.gameId;
      const currentTileRack = this.gameStateService.localState.tiles;
      const tilesToBeDrawn = 7 - this.gameStateService.localState.tiles.length;

      this._socket.emitSocketEvent(DRAW_TILES_EVENT, {
        gameId,
        currentTileRack,
        amountDrawn: tilesToBeDrawn
      });
    }
  }

  private checkIfThisPlayersTurn(): boolean {
    return this.playerTurn === this.thisPlayerId;
  }

  public startGame() {
    if (this.currentPlayers && this.currentPlayers.length > 1) {
      this.startGameEvent.emit(true);
    }
  }

  public changeCurrentMenu(menu: string) {
    this.currentMenu = menu;
  }

  public checkWordValidity() {
    const inputElement = this.checkWordInput.nativeElement;
    const inputValue = inputElement.value.trim();

    if (inputValue.length <= 1) {
      this._renderer.addClass(inputElement, 'invalid-input');
      return;

    } else {
      this._renderer.removeClass(inputElement, 'invalid-input');
      this._http.get(`${this.WORD_API_URL}/api/word/${inputValue}`)
        .pipe(first())
        .subscribe((result: any) => {
          if (result.response === false) {
            this._renderer.addClass(inputElement, 'invalid-word');

          } else {
            this._renderer.addClass(inputElement, 'valid-word');
          }
        });
    }
  }

  public handleTurnEnd() {
    if (this.checkIfThisPlayersTurn()) {
      const boardState = this.gameStateService.globalState.boardState;
      // If the player used all 7 tiles this turn, add an extra 50 points
      if (this.tilePieces.length === 0) {
        this._game.updatePlayerScore(50);
      }
      this._game.updateWordRegistryAndCalculateScore(boardState);
      this._game.determineNextPlayerTurn();

      // Propagate State
      this._socket.emitSocketEvent(
        UPDATE_STATE_FROM_CLIENT,
        this.gameStateService.globalState
      );
    }
  }

  // Deselect selected tiles then select the clicked tile
  public handleSelectTile(clickedTile: TilePieceComponent) {
    // Execute only if it's the current player's turn
    if (this.checkIfThisPlayersTurn()) {
      const tilePiecesArray = this.tilePieces.toArray();

      // Deselect other tiles
      tilePiecesArray.forEach(tile => tile.tileInstance!.selected = false);

      // Select clicked tile
      clickedTile.tileInstance!.selected = true;

      this._game.selectTile(clickedTile);
    }
  }

  public tradeTiles() {
    // Trading is only available if a tile is currently selected and
    // hasn't been traded this turn
    if (this._game.selectedTile !== null &&
        this._game.selectedTile.tileInstance!.tradeable === true) {

      const gameId = this.gameStateService.globalState.gameId!;
      const selectedTileIdentifier = this._game.selectedTile.tileInstance?.identifier;
      let currentTiles = this.gameStateService.localState.tiles;
      let removedTile: TilePiece;

      // Remove the tile from the tile rack and filter it from state
      removedTile = this._game.removeTileFromRack(currentTiles, selectedTileIdentifier);

      // Send the removed tile back to the server
      this._game.returnTileToServerTileBag(gameId, removedTile);

      // Deselect the tile
      this._game.selectTile(null);

      // Send gameId and tilerack to server to handle trade
      this._socket.emitSocketEvent(TRADE_TILES_EVENT, {
        gameId, playerTileRack: currentTiles
      });
    }
  }

}
