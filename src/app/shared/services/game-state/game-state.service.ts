import { Injectable } from '@angular/core';
import {
  BoardSquare,
  CurrentPlayers,
  GameBoard,
  IGameState,
  ILocalState,
  TileBag,
  TilePiece,
  WordsRegistry
} from 'src/app/types';
import { StateService } from '../state/state.service';
import { generateNewTileBag, generateNewBoard } from '../../../helpers'
import { Observable } from 'rxjs';
import { SocketService } from '../socket/socket.service';
import {
  UPDATE_GLOBAL_STATE_FROM_SERVER,
  UPDATE_LOCAL_STATE_FROM_SERVER,
  UPDATE_STATE_FROM_CLIENT
} from 'src/app/constants';

const initialLocalState: ILocalState = {
  playerId: '',
  tiles: []
}

const initialState: IGameState = {
  gameId: '',
  currentPlayers: [],
  tileBag: undefined,
  boardState: null,
  gameStarted: false,
  playerTurn: null,
  currentWordsRegistry: {}
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService extends StateService<IGameState> {

  // Global GameState Properties
  public readonly gameId$: Observable<string | null> = this.selectGlobal(
    state => state.gameId
  );
  public readonly currentPlayers$: Observable<CurrentPlayers> = this.selectGlobal(
    state => state.currentPlayers
  );
  public readonly tileBag$: Observable<TileBag> = this.selectGlobal(
    state => state.tileBag
  );
  public readonly boardState$: Observable<GameBoard> = this.selectGlobal(
    state => state.boardState
  );
  public readonly gameStarted$: Observable<boolean> = this.selectGlobal(
    state => state.gameStarted
  );
  public readonly playerTurn$: Observable<string | null> = this.selectGlobal(
    state => state.playerTurn
  );
  public readonly currentWordsRegistry$: Observable<WordsRegistry> = this.selectGlobal(
    state => state.currentWordsRegistry
  );

  // Local GameState Properties
  public readonly thisPlayersId$: Observable<string | undefined> = this.selectLocal(
    state => state.playerId
  );
  public readonly thisPlayersTiles$: Observable<TilePiece[]> = this.selectLocal(
    state => state.tiles
  );

  // Pass initialState to StateService to initialize BehaviorSubject
  constructor(private _socket: SocketService) {
    super(initialState, initialLocalState);

    // Watch global state
    this.observeGlobalServerState().subscribe((gameState: any) => {
      this.setGlobalState({
        gameId: gameState.gameId,
        currentPlayers: gameState.currentPlayers,
        tileBag: gameState.tileBag,
        boardState: gameState.boardState,
        gameStarted: gameState.gameStarted,
        playerTurn: gameState.playerTurn,
        currentWordsRegistry: gameState.currentWordsRegistry
      });
    });

    // Watch local state
    this.observeLocalStateFromServer().subscribe((localState: ILocalState) => {
      this.setLocalState(localState);
    });
  }

  // Socket State Observables
  private observeGlobalServerState(): Observable<IGameState> {
    return this._socket.observeSocketEvent(
      UPDATE_GLOBAL_STATE_FROM_SERVER
    );
  }

  private observeLocalStateFromServer(): Observable<ILocalState> {
    return this._socket.observeSocketEvent(
      UPDATE_LOCAL_STATE_FROM_SERVER
    );
  }

  // Global state helpers
  public setAllGlobalState(state: IGameState | Partial<IGameState>) {
    this.setGlobalState(state);
  }

  public setNewTileBag() {
    const tileBag: TileBag = generateNewTileBag();
    this.setGlobalState({ tileBag: tileBag });
  }

  public alterBoardStructure(coords: string[], updatedSquareData: BoardSquare) {
    const currentBoardState = this.globalState.boardState!;
    let x: number, y: number;
    let [xC, yC] = coords;
    x = parseInt(xC);
    y = parseInt(yC);
    currentBoardState[y][x] = updatedSquareData;

    // Set the state
    this.setGlobalState({ boardState: currentBoardState });

    // Propagate state to all clients
    this._socket.emitSocketEvent(
      UPDATE_STATE_FROM_CLIENT,
      this.globalState
    );
  }

  public resetBoardStructure() {
    const freshBoard = generateNewBoard();
    this.setGlobalState({ boardState: freshBoard });
  }

  public setGameStarted(gameStarted: boolean) {
    // Set the state
    this.setGlobalState({ gameStarted });

    // Propagate state to all clients
    this._socket.emitSocketEvent(
      UPDATE_STATE_FROM_CLIENT,
      this.globalState
    );
  }

  public setNextPlayerTurn(playerId: string | undefined) {
    if (playerId !== undefined) {
      // Set the state
      this.setGlobalState({ playerTurn: playerId });

      // Propagate state to all clients
      this._socket.emitSocketEvent(
        UPDATE_STATE_FROM_CLIENT,
        this.globalState
      );
    }
  }


  // Local state helpers
  public setAllLocalState(localState: ILocalState) {
    this.setLocalState(localState);
  }

  public setLocalPlayerId(playerId: string) {
    this.setLocalState({ playerId });
  }

  public setLocalTiles(tiles: TilePiece[]) {
    this.setLocalState({ tiles: tiles });
  }

}
