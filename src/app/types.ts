export type PlayerID = string;
export type PlayerName = string;
export type PlayerScore = number;

export type Player = {
  playerId: PlayerID | undefined;
  name: PlayerName;
  active: Boolean;
  score: PlayerScore;
}

export type CurrentPlayers = Player[];

export type TilePiece = {
  identifier: number | null;
  displayed: boolean;
  tradeable: boolean | null,
  selected: boolean;
  letterPointValue: number | null;
  letter: string;
  texturePath: string;
}

export type TileMap = {
  [key: string]: object[]
}

export type TileBag = TilePiece[] | undefined;

export type BoardSquare = {
  tileIdentifier: number | null,
  hasTile: boolean,
  containedTileTradeable: boolean | null,
  lockedIn: boolean,
  squareType: string,
  letter: string,
  letterPointValue: number | null,
  texturePath: string,
  wordModifierExhausted: boolean
}

export type GameBoard = BoardSquare[][] | null;

export type WordsRegistry = {
  [key: string]: {
    frequencies: {
      [key: string]: BoardSquare[];
    };
  };
}

export type WordData = {
  word: string;
  associatedTiles: BoardSquare[];
}

export interface ILocalState {
  playerId: PlayerID;
  tiles: TilePiece[];
}

export interface IGameState {
  gameId: string | null;
  currentPlayers: CurrentPlayers | [];
  tileBag: TileBag;
  boardState: GameBoard;
  gameStarted: boolean;
  playerTurn: string | null; // playerTurn is the socket.id of the player
  currentWordsRegistry: WordsRegistry;
}
