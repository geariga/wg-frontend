import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket

  constructor() {
    this.socket = io(environment.socketServer);
  }

  public emitSocketEvent(eventName: string, data: Object): boolean {
    try {
      this.socket.emit(eventName, data);
      return true;
    } catch (err: any) {
      console.log(err.message)
      return false;
    }
  }

  public observeSocketEvent(eventName: string): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      try {
        this.socket.on(eventName, (data) => {
            if (data) observer.next(data);
            else observer.error('Server Error');
        });
        // return () => {
        //     this.socket.disconnect();
        // };
      } catch (e) {
        console.error(e);
        throw e;
      }
    });
  }

}
