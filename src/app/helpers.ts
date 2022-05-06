'use strict';

import { fullBoardStructure, tileMap } from "./constants";
import { TileBag } from "./types";

const getRandomTexturePath = (): string => {
  const textureIndex = Math.ceil(Math.random() * 5);
  return `tile-texture-${textureIndex}.jpg`;
}

export const generateNewBoard = () => {
  // In each row of boardStructure...
  return fullBoardStructure.map(row => {

    // ...map each cell to an object containing square data
    return row.map((squareType) => {
      return {
        tileIdentifier: null,
        hasTile: false,
        containedTileTradeable: null,
        lockedIn: false,
        squareType,
        letter: '',
        letterPointValue: null,
        texturePath: '',
        wordModifierExhausted: false
      }
    });
  });
}

// Creates a fresh tileBag array of length 100
export const generateNewTileBag = (): TileBag => {
  const tileBag: TileBag = [];
  const tileMapKeys = Object.keys(tileMap);
  let tilesWithThisTotalAvailable,
      availableTiles: number,
      currentLetter,
      pointsValue,
      tileIdentifier = 0;

  // Loop through each tileMap key (the # of tiles available for those letters)
  tileMapKeys.forEach(key => {
    availableTiles = parseInt(key);
    tilesWithThisTotalAvailable = tileMap[key];

    // Loop through that key's tiles
    tilesWithThisTotalAvailable.forEach((letterObj: any) => {
      currentLetter = Object.keys(letterObj)[0];
      pointsValue = letterObj[currentLetter];

      // Create the total available tiles for that letter
      for (let i = 0; i < availableTiles; i++) {
        tileBag.push({
          identifier: tileIdentifier,
          displayed: true,
          tradeable: true,
          selected: false,
          letterPointValue: parseInt(pointsValue),
          letter: currentLetter,
          texturePath: getRandomTexturePath()
        });
        tileIdentifier++;
      }
    })
  });
  return tileBag;
}

export const getRandomIndexFromArray = (array: any[]): number => {
  return Math.floor(Math.random() * array.length);
}
