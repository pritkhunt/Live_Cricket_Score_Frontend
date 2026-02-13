import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'https://live-cricket-score-backend.onrender.com/api/matches';

  constructor(private http: HttpClient) { }

  getLiveMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/live`);
  }

  getMatchById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
