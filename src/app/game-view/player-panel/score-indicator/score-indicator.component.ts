import { Component, Input } from '@angular/core';
import { Player } from 'src/app/types';

@Component({
  selector: 'app-score-indicator',
  template: `
    <span [ngClass]="playerTurn === player?.playerId ? 'is-turn' : 'is-not-turn'">
      {{ player?.name }}: {{ player?.score }}
    </span>
  `,
  styleUrls: ['./score-indicator.component.css']
})
export class ScoreIndicatorComponent {

  @Input() player: Player | undefined;
  @Input() playerTurn!: string | null;

  constructor() { }

}
