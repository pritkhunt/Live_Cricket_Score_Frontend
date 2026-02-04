import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.scss'
})
export class MatchListComponent implements OnInit, OnDestroy {
  matches: any[] = [];
  private scoreSub: Subscription | undefined;

  constructor(
    private matchService: MatchService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadMatches();
    this.setupRealtimeUpdates();
  }

  ngOnDestroy(): void {
    if (this.scoreSub) {
      this.scoreSub.unsubscribe();
    }
  }

  loadMatches(): void {
    this.matchService.getLiveMatches().subscribe({
      next: (data) => {
        this.matches = data;
      },
      error: (err) => console.error('Error loading matches', err)
    });
  }

  setupRealtimeUpdates(): void {
    this.scoreSub = this.socketService.onEvent('score_update').subscribe((updatedMatch: any) => {
      const index = this.matches.findIndex(m => m.matchId === updatedMatch.matchId);
      if (index !== -1) {
        this.matches[index] = updatedMatch;
      } else {
        this.matches.push(updatedMatch);
      }
    });
  }

  trackByMatchId(index: number, match: any): string {
    return match.matchId;
  }
}
