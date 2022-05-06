import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RETURN_TILE_EVENT } from 'src/app/constants';
import { TilePieceComponent } from 'src/app/game-view/tile-piece/tile-piece.component';
import {
  CurrentPlayers,
  WordsRegistry,
  GameBoard,
  TilePiece,
  WordData,
  BoardSquare
} from 'src/app/types';
import { GameStateService } from '../game-state/game-state.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private _selectedTile$!: BehaviorSubject<TilePieceComponent | null>;
  private currentPlayers!: CurrentPlayers;
  private currentWordsRegistry!: WordsRegistry;

  public get selectedTile(): TilePieceComponent | null {
    return this._selectedTile$.getValue();
  }

  constructor(
    private _socket: SocketService,
    private _gameStateService: GameStateService
  ) {
    this._selectedTile$ = new BehaviorSubject<TilePieceComponent | null>(null);

    // Update currentPlayers as they leave or join
    this._gameStateService.currentPlayers$.subscribe(players => {
      this.currentPlayers = players;
    });

    // Update currentWordsRegistry to detect changes in word frequencies
    this._gameStateService.currentWordsRegistry$.subscribe(currentWords => {
      this.currentWordsRegistry = currentWords;
    });
  }

  // Sets the "lockedIn" property of all board squares to "true"
  private lockInTilesOnBoard() {
    const boardState = this._gameStateService.globalState.boardState;
    boardState?.forEach(row => {
      row.forEach(square => square.lockedIn = true);
    });
    this._gameStateService.setAllGlobalState({ boardState });
  }

  // Any tiles received in a trade this turn will be available to trade
  // again next turn
  private resetPlayerTileTradeable() {
    const playerTiles = this._gameStateService.localState.tiles;
    playerTiles.forEach(tile => tile.tradeable = true);
    this._gameStateService.setLocalTiles(playerTiles);
  }

  private passTurn(nextPlayerId: string | undefined) {
    this.lockInTilesOnBoard();
    this.resetPlayerTileTradeable();
    this._gameStateService.setNextPlayerTurn(nextPlayerId);
  }

  private detectHorizontalWords(board: GameBoard): object[] {
    let formedWord: string,
        foundWords: object[] = [],
        associatedTiles: object[];

    board?.forEach(row => {
      // Restart formedWord and associatedTiles on each row iteration start
      formedWord = '';
      associatedTiles = [];

      row.forEach((square, idx) => {
        // If the boardSquare has a tile placed in it
        if (square.letter !== '') {
          formedWord += square.letter;
          associatedTiles.push(square);

          // If formedWord will only be a single letter-word, terminate the word
          if (formedWord.length === 1 && (!row[idx+1] || row[idx+1].letter === '')) {
            formedWord = '';
            associatedTiles = [];
          }

        // If the current word of length > 1 is ending, add it to found words
        } else if (formedWord.length > 1 && (!row[idx+1] || row[idx+1].letter === '')) {
          foundWords.push({
            word: formedWord,
            associatedTiles
          });
          formedWord = '';
          associatedTiles = [];
        }
      });
    });
    return foundWords;
  }

  private detectVerticalWords(board: GameBoard): WordData[] {
    let formedWord: string,
        foundWords: WordData[] = [],
        associatedTiles: BoardSquare[] = [],
        square, nextSquare,
        col, row;

    // Loop top -> down, starting with the top-left corner of the board
    for (col = 0; col < 15; col++) {
      // Restart formedWord on each column start
      formedWord = '';
      associatedTiles = [];

      for (row = 0; row < 15; row++) {
        square = board![row][col];
        nextSquare = board![row+1] ? board![row+1][col] : undefined;

        // If the boardSquare has a tile placed in it
        if (square.letter !== '') {
          formedWord += square.letter;
          associatedTiles.push(square);

          // If formedWord will only be a single letter-word, terminate the word
          if (formedWord.length === 1 && (!nextSquare || nextSquare.letter === '')) {
            formedWord = '';
            associatedTiles = [];
          }

        // If the current word of length > 1 is ending, add it to found words
        } else if (formedWord.length > 1 && (!nextSquare || nextSquare.letter === '')) {
          foundWords.push({
            word: formedWord,
            associatedTiles
          });
          formedWord = '';
          associatedTiles = [];
        }
      }
    }
    return foundWords;
  }

  /*
    returns: {
      'word': {
        frequencies: {
          1: associatedTiles,
          2: associatedTiles,
          n: associatdTiles
        },
      }
    }
  */
  private getUpdatedWordsRegistry(updatedWords: WordData[]): WordsRegistry {
    const onlyWords = updatedWords.map(wordData => wordData.word);
    const onlyUniqueWords = new Set(onlyWords);
    const updatedRegistry: WordsRegistry = {};
    let thisWordOccurrences: WordData[] = [];

    onlyUniqueWords.forEach(word => {
        updatedRegistry[word] = { frequencies: {} };
        thisWordOccurrences = updatedWords.filter(wordData => wordData.word === word);
        thisWordOccurrences.forEach((wordData, idx) => {
            updatedRegistry[word].frequencies[idx] = wordData.associatedTiles;
        });
    });

    return updatedRegistry;
  }

  private getChangesForScoreCalculation(updatedRegistry: WordsRegistry) {
    const scoresToBeCalculated: BoardSquare[][] = [];
    const updatedWordsList = Object.keys(updatedRegistry);
    let registeredFrequencies: string[] | undefined,
        updatedFrequencies: string[],
        currFreqBeingCompared: BoardSquare[],
        regFreqsBeingCompared: BoardSquare[],
        currTileIdentifiers: any[],
        regTileIdentifiers: any[],
        regTileIdsForThisFreq: any[][],
        isUniqueOccurence;

    updatedWordsList.forEach(word => {
        // If any, get the registered frequencies for the current word
        registeredFrequencies = this.currentWordsRegistry[word] ?
            Object.keys(this.currentWordsRegistry[word].frequencies) : undefined;

        // Get the updated frequencies for the current word
        updatedFrequencies = Object.keys(updatedRegistry[word].frequencies);

        // If the word is newly registered
        if (registeredFrequencies === undefined) {

            // Add its occurrences to scoresToBeCalculated
            updatedFrequencies.forEach(freq => {
                scoresToBeCalculated.push(updatedRegistry[word].frequencies[freq]);
            });

        // If the word is already registered, check for any new frequencies
        } else {

            // Compare the updatedFrequencies to the registeredFrequencies and check for differences
            updatedFrequencies.forEach(uFreq => {
                isUniqueOccurence = true;
                currFreqBeingCompared = updatedRegistry[word].frequencies[uFreq];
                currTileIdentifiers = currFreqBeingCompared.map(tile => tile.tileIdentifier);
                regTileIdsForThisFreq = [];

                // Combine the currently registered frequencies for the current word
                registeredFrequencies!.forEach(rFreq => {
                    regFreqsBeingCompared = this.currentWordsRegistry[word].frequencies[rFreq];
                    regTileIdentifiers = regFreqsBeingCompared.map(tile => tile.tileIdentifier);
                    regTileIdsForThisFreq.push(regTileIdentifiers);
                });

                // Loop through all registered frequencies and see if the currFreqBeingCompared is unique
                regTileIdsForThisFreq.forEach(rTileIds => {
                    // If any of the currently registered frequencies match all currTileIdentifiers,
                    // the entry is not unique
                    if (currTileIdentifiers.every(cTileId => rTileIds.includes(cTileId))) {
                        isUniqueOccurence = false;
                    }
                });

                if (isUniqueOccurence === true) {
                    scoresToBeCalculated.push(updatedRegistry[word].frequencies[uFreq]);
                }
            });
        }
    });

    // console.log(scoresToBeCalculated)
    return scoresToBeCalculated;
  }

  private calculateScore(scores: BoardSquare[][] | []): number {
    let allWordScoreModifiers = ['dw', 'tw', '★'],
        allLetterScoreModifiers = ['dl', 'tl'],
        wordScoreModifers: number[],
        letterScoreModifier: number,
        wordScore: number,
        scoreOutcome = 0;

    scores.forEach(wordData => {
      wordScore = 0;
      wordScoreModifers = [];

      wordData.forEach(boardSquare => {
        letterScoreModifier = 1;
        // Detect letter score modifier
        if (allLetterScoreModifiers.includes(boardSquare.squareType)) {
          letterScoreModifier = boardSquare.squareType === 'dl' ? 2 : 3;
        }

        // Detect word score modifiers
        if (boardSquare.wordModifierExhausted === false &&
            allWordScoreModifiers.includes(boardSquare.squareType)) {

          // If the word score is tripled
          if (boardSquare.squareType === 'tw') {
            wordScoreModifers.push(3);

          // If the word score is doubled
          } else {
            wordScoreModifers.push(2);
          }

          this.disableWordScoreModifier(boardSquare.tileIdentifier);
        }

        // Apply any letter score modifier
        wordScore += boardSquare.letterPointValue! * letterScoreModifier;
      });

      // Apply any word score modifiers and add to scoreOutcome
      wordScoreModifers.forEach(wMod => wordScore *= wMod);
      scoreOutcome += wordScore;
    });

    console.log(scores);
    console.log(scoreOutcome);
    return scoreOutcome;
  }


  private disableWordScoreModifier(tileIdentifier: number | null) {
    if (tileIdentifier === null) return;
    const boardState = this._gameStateService.globalState.boardState;

    ParentLoop:
    for (let row = 0; row < boardState!.length; row++) {
      for (let col = 0; col < boardState![row].length; col++) {
        if (boardState![row][col].tileIdentifier === tileIdentifier) {
          boardState![row][col].wordModifierExhausted = true;
          this._gameStateService.setAllGlobalState({ boardState });
          break ParentLoop;
        }
      }
    }
  }

  public updateWordRegistryAndCalculateScore(board: GameBoard) {
    const horizontalWords = this.detectHorizontalWords(board);
    const verticalWords = this.detectVerticalWords(board);
    const allWords = [...horizontalWords, ...verticalWords] as WordData[];
    const updatedRegistry = this.getUpdatedWordsRegistry(allWords);
    const scoresToBeCalculated = this.getChangesForScoreCalculation(updatedRegistry);
    const score = this.calculateScore(scoresToBeCalculated);
    this.updatePlayerScore(score);

    // Registry is updated here after all calculations have been made
    this._gameStateService.setAllGlobalState({
      currentWordsRegistry: updatedRegistry
    });
  }

  public updatePlayerScore(pointsAdded: number) {
    const thisPlayerId = this._gameStateService.localState.playerId;
    const currentPlayers = this._gameStateService.globalState.currentPlayers;
    for (let i = 0; i < currentPlayers.length; i++) {
      if (currentPlayers[i].playerId === thisPlayerId) {
        currentPlayers[i].score += pointsAdded;
        break;
      }
    }
    this._gameStateService.setAllGlobalState({ currentPlayers });
  }

  public returnTileToServerTileBag(gameId: string, tile: TilePiece | undefined) {
    if (tile === undefined) return;
    this._socket.emitSocketEvent(RETURN_TILE_EVENT, {gameId, tile});
  }

  public determineNextPlayerTurn() {
    const currentPlayerTurnId = this._gameStateService.globalState.playerTurn;
    let currentIndex, nextPlayerIndex, nextPlayerId;

    // Get the current player's index
    for (let i = 0; i < this.currentPlayers.length; i++) {
      if (this.currentPlayers[i].playerId === currentPlayerTurnId) {
        currentIndex = i;
        break;
      }
    }

    // Get next player index, accounting for the end of the currentPlayers array
    if (currentIndex !== undefined) {
      nextPlayerIndex = this.currentPlayers[currentIndex + 1] === undefined ?
        0 : currentIndex + 1;
      nextPlayerId = this.currentPlayers[nextPlayerIndex].playerId;
      this.passTurn(nextPlayerId);
    } else {
      console.error(
        'GameService: determineNextPlayerTurn, currentIndex is undefined'
      );
    }
  }

  public removeTileFromRack(tileRack: TilePiece[], tileIdentifier: any): any {
    let removedTile
    for (let i = 0; i < tileRack.length; i++) {
      if (tileRack[i].identifier === tileIdentifier) {
        removedTile = tileRack.splice(i, 1)[0];
        break;
      }
    }
    this._gameStateService.setLocalTiles(tileRack);
    return removedTile;
  }

  public selectTile(tile: TilePieceComponent | null) {
    this._selectedTile$.next(tile);
  }

}
