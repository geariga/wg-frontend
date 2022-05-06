'use strict';

import { TileMap } from "./types";

//// HTTP CONSTANTS ////
export const WORD_API_URL = 'http://localhost:9090/api/word'; // This needs updated for prod

//// EVENT CONSTANTS ////
export const UPDATE_GLOBAL_STATE_FROM_SERVER = 'update-global-state-from-server';
export const UPDATE_LOCAL_STATE_FROM_SERVER = 'update-local-state-from-server';
export const UPDATE_STATE_FROM_CLIENT = 'update-state-from-client';
export const CREATE_ROOM_EVENT = 'create-room';
export const JOIN_ROOM_EVENT = 'join-room';
export const GAME_START_EVENT = 'start-game';
export const START_TURN_EVENT = 'start-turn';
export const TRADE_TILES_EVENT = 'trade-tiles';
export const DRAW_TILES_EVENT = 'draw-tiles';
export const RETURN_TILE_EVENT = 'return-tile';
export const DETERMINE_FIRST_PLAYER_EVENT = 'determine-first-player';
export const UPDATE_CURRENT_WORDS_REGISTRY_EVENT = 'update-current-words-registry';

//// DATA CONSTANTS ////
// Basic structure of the board. Upon game start, each "square" will be
// changed to an object containing the corresponding data.
export const fullBoardStructure = [
  ['tw', '', '', 'dl', '', '', '', 'tw', '', '', '', 'dl', '', '', 'tw'],
  ['', 'dw', '', '', '', 'tl', '', '', '', 'tl', '', '', '', 'dw', ''],
  ['', '', 'dw', '', '', '', 'dl', '', 'dl', '', '', '', 'dw', '', ''],
  ['dl', '', '', 'dw', '', '', '', 'dl', '', '', '', 'dw', '', '', 'dl'],
  ['', '', '', '', 'dw', '', '', '', '', '', 'dw', '', '', '', ''],
  ['', 'tl', '', '', '', 'tl', '', '', '', 'tl', '', '', '', 'tl', ''],
  ['', '', 'dl', '', '', '', 'dl', '', 'dl', '', '', '', 'dl', '', ''],
  ['tw', '', '', 'dl', '', '', '', '★', '', '', '', 'dl', '', '', 'tw'],
  ['', '', 'dl', '', '', '', 'dl', '', 'dl', '', '', '', 'dl', '', ''],
  ['', 'tl', '', '', '', 'tl', '', '', '', 'tl', '', '', '', 'tl', ''],
  ['', '', '', '', 'dw', '', '', '', '', '', 'dw', '', '', '', ''],
  ['dl', '', '', 'dw', '', '', '', 'dl', '', '', '', 'dw', '', '', 'dl'],
  ['', '', 'dw', '', '', '', 'dl', '', 'dl', '', '', '', 'dw', '', ''],
  ['', 'dw', '', '', '', 'tl', '', '', '', 'tl', '', '', '', 'dw', ''],
  ['tw', '', '', 'dl', '', '', '', 'tw', '', '', '', 'dl', '', '', 'tw']
];

// This map is used to create a new set of tiles. The key
// represents the amount available for each letter, the value
// is an array of objects, of which the keys are the letters,
// and the value is the point value for the corresponding letter.
// --> Used by "generateNewTileBag"
export const tileMap: TileMap = {
  [1]: [{'J': 8}, {'K': 5}, {'Q': 10}, {'X': 8}, {'Z': 10}],
  [2]: [{'_': 0}, {'B': 3}, {'C': 3}, {'F': 4}, {'H': 4},
      {'M': 3}, {'P': 3}, {'V': 4}, {'W': 4}, {'Y': 4}],
  [3]: [{'G': 2}],
  [4]: [{'D': 2}, {'L': 1}, {'S': 1}, {'U': 1}],
  [6]: [{'N': 1}, {'R': 1}, {'T': 1}],
  [8]: [{'O': 1}],
  [9]: [{'A': 1}, {'I': 1}],
  [12]: [{'E': 1}]
}
