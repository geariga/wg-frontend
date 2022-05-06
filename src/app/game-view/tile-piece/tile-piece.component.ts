import { Component, Input } from '@angular/core';
import { TilePiece } from 'src/app/types';

@Component({
  selector: 'app-tile-piece',
  templateUrl: 'tile-piece.component.html',
  styleUrls: ['tile-piece.component.css']
})
export class TilePieceComponent {

  @Input() tileInstance!: TilePiece | undefined;

  constructor() { }

}
