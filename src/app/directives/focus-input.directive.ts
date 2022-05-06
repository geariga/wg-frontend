import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appFocusInput]'
})
export class FocusInputDirective implements OnInit {

  constructor(private _el: ElementRef) {
    if (!_el.nativeElement['focus']) {
      throw new Error(`Element: ${_el} does not accept focus.`);
    }
  }

  ngOnInit(): void {
    const inputElement: HTMLInputElement = this._el.nativeElement as HTMLInputElement;
    inputElement.focus();
    inputElement.select();
  }

}
