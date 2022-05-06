import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../shared/services/socket/socket.service';
import { GameStateService } from '../shared/services/game-state/game-state.service';
import { first } from 'rxjs';
import { CREATE_ROOM_EVENT, JOIN_ROOM_EVENT } from '../constants';

@Component({
  selector: 'app-menu-view',
  templateUrl: 'menu-view.component.html',
  styleUrls: ['menu-view.component.css']
})
export class MenuViewComponent {

  @ViewChild('container') parent!: ElementRef;
  @ViewChild('displayNameInput') displayNameInput!: ElementRef;
  @ViewChild('gameIdInput') gameIdInput!: ElementRef;

  public currentMenu = 'main-menu';

  constructor(
    private _renderer: Renderer2,
    private _router: Router,
    private _gameStateService: GameStateService,
    private socketService: SocketService,
  ) { }

  private async changeView(path: string) {
    await this.fadeViewOut();
    this._router.navigate([path]);
  }

  private fadeViewOut(): Promise<void> {
    let opacity = 1;
    this._renderer.setStyle(this.parent.nativeElement, 'opacity', opacity);
    return new Promise((resolve, _) => {
      const interval = setInterval(() => {
        if (opacity === 0) {
          clearInterval(interval);
          resolve();
        }
        opacity -= 0.1;
        opacity = parseFloat(opacity.toFixed(1));
        this._renderer.setStyle(this.parent.nativeElement, 'opacity', opacity);
      }, 15);
    });
  }

  public swapMenu(menu: string) {
    this.currentMenu = menu;
  }

  public createNewGame() {
    const inputElement = this.displayNameInput.nativeElement;
    const displayName = inputElement.value.trim();

    if (!this.checkIfInputValueIsValid('displayNameInput')) {
      return;
    } else {
      this._renderer.removeClass(inputElement, 'invalid-input');
      this._gameStateService.resetBoardStructure();
      this._gameStateService.setNewTileBag();
      this.socketService.emitSocketEvent(CREATE_ROOM_EVENT, {
        initialState: this._gameStateService.globalState,
        displayName
      });
      this.changeView('game');
    }
  }

  public joinExistingGame() {
    const displayNameInput = this.displayNameInput.nativeElement;
    const gameIdInputElement = this.gameIdInput.nativeElement;
    const gameId = gameIdInputElement.value.toUpperCase();

    if (!this.checkIfInputValueIsValid('displayNameInput')) return
    if (!this.checkIfInputValueIsValid('gameIdInput')) return

    this._renderer.removeClass(displayNameInput, 'invalid-input');
    this._renderer.removeClass(gameIdInputElement, 'invalid-input');

    this.socketService.emitSocketEvent(JOIN_ROOM_EVENT, {
      gameId,
      displayName: displayNameInput.value
    });

    this.socketService.observeSocketEvent('game-id-checked').pipe(first())
      .subscribe((accepted: boolean) => {
        if (accepted === true) {
          this.changeView('game');
        } else {
          // Add handling for invalid game id
          return;
        }
      }
    );
  }

  public checkIfInputValueIsValid(type: string): boolean {
    let inputElement, inputValue;
    switch (type) {
      case 'displayNameInput': {
        inputElement = this.displayNameInput.nativeElement;
        inputValue = inputElement.value.trim();
        if (inputValue === '' || inputValue.length > 12) {
          this._renderer.addClass(inputElement, 'invalid-input');
          return false;
        } else return true;
      }
      case 'gameIdInput': {
        inputElement = this.gameIdInput.nativeElement;
        inputValue = inputElement.value.trim();
        if (inputValue === '' || inputValue.length !== 4) {
          this._renderer.addClass(inputElement, 'invalid-input');
          return false;
        } else return true;
      }
      default: {
        console.log('Invalid input type argument.');
        return false;
      }
    }
  }

}
