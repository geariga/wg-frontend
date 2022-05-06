import { Component, Input } from '@angular/core';
import { GameBoard } from 'src/app/types';

@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  styleUrls: ['./gameboard.component.css']
})
export class GameboardComponent {

  @Input() gameStarted!: boolean | null;
  @Input() boardStructure!: GameBoard;
  @Input() isThisPlayersTurn!: boolean;
  @Input() isTileSelected!: boolean;

  constructor() { }

}
