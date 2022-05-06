import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  public saveObjectToLocalStorage(key: string, obj: Object) {
    const stringified = JSON.stringify(obj);
    localStorage.setItem(key, stringified);
  }

  public retrieveObjectFromLocalStorage(key: string) {
    const stringified = JSON.stringify(localStorage.getItem(key));
    return JSON.parse(stringified);
  }

}
