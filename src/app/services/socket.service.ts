import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly URL = 'https://live-cricket-score-backend.onrender.com'; // Backend URL

  constructor(private ngZone: NgZone) {
    this.socket = io(this.URL);
  }

  // Listen for events
  onEvent(key: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(key, (data) => {
        this.ngZone.run(() => {
          observer.next(data);
        });
      });
    });
  }

  // Emit events
  emit(key: string, data: any): void {
    this.socket.emit(key, data);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
