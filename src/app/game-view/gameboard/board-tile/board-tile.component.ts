import { Component, Input, OnInit } from '@angular/core';
import { GameStateService } from 'src/app/shared/services/game-state/game-state.service';
import { GameService } from 'src/app/shared/services/game/game.service';
import { BoardSquare, TilePiece } from 'src/app/types';
import { TilePieceComponent } from '../../tile-piece/tile-piece.component';

@Component({
  selector: 'app-board-tile',
  templateUrl: './board-tile.component.html',
  styleUrls: ['./board-tile.component.css']
})
export class BoardTileComponent implements OnInit {

  // The coords of this boardSquare within boardState.
  @Input() coords!: string;

  // The object located at the coords of boardState
  @Input() squareObject!: BoardSquare;

  // The type of the square (double word, double letter, etc...)
  @Input() boardSquareType!: string;

  // The text displayed in the square, either squareType or the letter value
  @Input() boardSquareText!: string;

  // The color of the square that corresponds with boardSquareType.
  @Input() boardSquareColor!: string;

  // The background image of the square if the tile has been placed
  @Input() boardSquareImage!: string;

  // The base point value of the letter placed on the square, if any
  @Input() letterPointValue!: number | null;

  // A boolean telling whether or a not tile is placed on this square
  @Input() isTilePlaced!: boolean;

  constructor(
    private _gameStateService: GameStateService,
    private _game: GameService
  ) { }

  ngOnInit(): void { }

  private placeTile = (coords: string[], cmp: TilePieceComponent | null) => {
    let boardSquare: BoardSquare;
    if (cmp !== null && this.isTilePlaced === false) {

      // Create the BoardSquare instance to update boardState with
      boardSquare = {
        tileIdentifier: cmp.tileInstance!.identifier,
        hasTile: true,
        containedTileTradeable: cmp.tileInstance!.tradeable,
        lockedIn: false,
        squareType: this.boardSquareType,
        letter: cmp.tileInstance!.letter,
        letterPointValue: cmp.tileInstance!.letterPointValue,
        texturePath: cmp.tileInstance!.texturePath,
        wordModifierExhausted: false
      };

      // If the placed tile is blank, determine the letter it will act as
      if (cmp.tileInstance?.letter === '_') {
        this.decideBlankTileContent();
      }

      // Update boardState
      this._gameStateService.alterBoardStructure(coords, boardSquare);

      // Remove the tile from the player's rack
      this._game.removeTileFromRack(
        this._gameStateService.localState.tiles,
        cmp.tileInstance?.identifier
      );

      // Set the cooords and add the square to occupied squares list
      // cmp.tileInstance!.yCoord = parseInt(coords[0]);
      // cmp.tileInstance!.xCoord = parseInt(coords[1]);
      // this._game.occupySquare(cmp.tileInstance);

      // Reset selectedTile data
      this._game.selectTile(null);
    }
  }

  // Removes the tile from the board and creates a new TilePiece
  // to return to the player's TileRack
  private removeTile(coords: string[]) {
    let currentTiles: TilePiece[],
        rebuiltTile: TilePiece,
        rebuiltBoardSquare: BoardSquare,
        boardState,
        affectedBoardSquare,
        xC, yC,
        [x, y] = coords;

        xC = parseInt(x);
        yC = parseInt(y);

        boardState = this._gameStateService.globalState.boardState;
        affectedBoardSquare = boardState![yC][xC]

    // If no tile is currently selected and the clicked tile isn't locked in
    if (this._game.selectedTile === null &&
        affectedBoardSquare.lockedIn !== true) {

      currentTiles = this._gameStateService.localState.tiles;
      boardState = this._gameStateService.globalState.boardState;

      // Build the data for TilePiece
      rebuiltTile = {
        // xCoord: undefined,
        // yCoord: undefined,
        identifier: affectedBoardSquare.tileIdentifier,
        displayed: true,
        tradeable: affectedBoardSquare.containedTileTradeable,
        selected: false,
        letterPointValue: this.letterPointValue,
        letter: this.boardSquareText,
        texturePath: this.boardSquareImage
      };

      // Build fresh data for the updated BoardSquare
      rebuiltBoardSquare = {
        tileIdentifier: null,
        hasTile: false,
        containedTileTradeable: null,
        lockedIn: false,
        squareType: this.boardSquareType,
        letterPointValue: null,
        letter: '',
        texturePath: '',
        wordModifierExhausted: false
      }

      // Update boardState
      this._gameStateService.alterBoardStructure(coords, rebuiltBoardSquare);

      // Return the tile to the rack
      this._gameStateService.setLocalTiles([...currentTiles, rebuiltTile]);
    }
  }

  private decideBlankTileContent() {
    console.log('determine blank tile')
  }

  public toggleTilePlacement() {
    const coords = this.coords.split('-');
    let selectedTile;

    if (this.isTilePlaced === false) {
      selectedTile = this._game.selectedTile;
      this.placeTile(coords, selectedTile);
    } else {
      this.removeTile(coords);
    }
  }

}
