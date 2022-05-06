import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TilePieceComponent } from './tile-piece.component';

describe('TilePieceComponent', () => {
  let component: TilePieceComponent;
  let fixture: ComponentFixture<TilePieceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TilePieceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TilePieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
