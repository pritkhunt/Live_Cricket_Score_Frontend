import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://live-cricket-score-backend.onrender.com/api';

  constructor(private http: HttpClient) { }

  getSeries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/series`);
  }

  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/teams`);
  }

  getNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/news`);
  }

  getNewsDetail(slug: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/news/${slug}`);
  }

  getTeamDetail(slug: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/teams/${slug}`);
  }

  getTeamMatches(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/teams/${slug}/matches`);
  }

  getTeamNews(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/teams/${slug}/news`);
  }

  getSeriesDetail(slug: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/series/${slug}`);
  }

  getSeriesMatches(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/series/${slug}/matches`);
  }

  getSeriesPoints(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/series/${slug}/points`);
  }

  getSeriesSquads(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/series/${slug}/squads`);
  }

  getSeriesSquadPlayers(slug: string, teamName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/series/${slug}/squads/players?team=${encodeURIComponent(teamName)}`);
  }

  getSeriesNews(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/series/${slug}/news`);
  }
}
