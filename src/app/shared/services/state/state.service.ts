import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { ILocalState } from 'src/app/types';

export class StateService<T> {

  private _globalState$!: BehaviorSubject<T>;
  private _localState$!: BehaviorSubject<ILocalState>;

  public get globalState(): T {
    return this._globalState$.getValue();
  }

  public get localState(): ILocalState {
    return this._localState$.getValue();
  }

  // Initialize state
  constructor(initialGlobalState: T, initialLocalState: ILocalState) {
    this._globalState$ = new BehaviorSubject<T>(initialGlobalState);
    this._localState$ = new BehaviorSubject<ILocalState>(initialLocalState);
  }

  // Used for selecting portions of state
  protected selectGlobal<K>(cb: (gState: T) => K): Observable<K> {
    return this._globalState$.asObservable().pipe(
      map((gState: T) => cb(gState)),
      distinctUntilChanged()
    );
  }

  protected selectLocal<K>(cb: (lState: ILocalState) => K): Observable<K> {
    return this._localState$.asObservable().pipe(
      map((lState: ILocalState) => cb(lState)),
      distinctUntilChanged()
    )
  }

  // Sets portions of global state
  protected setGlobalState(newState: Partial<T>) {
    this._globalState$.next({
      ...this.globalState,
      ...newState
    });
  }

  // Sets portions of local state
  protected setLocalState(newState: Partial<ILocalState>) {
    this._localState$.next({
      ...this.localState,
      ...newState
    });
  }

}
