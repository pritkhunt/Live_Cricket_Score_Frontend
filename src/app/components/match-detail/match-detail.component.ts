import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-detail.component.html',
  styleUrl: './match-detail.component.scss'
})
export class MatchDetailComponent implements OnInit, OnDestroy {
  match: any;
  activeTab: string = 'live';
  private scoreSub: Subscription | undefined;
  private matchId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('id');
    if (this.matchId) {
      this.loadMatch(this.matchId);
      this.setupRealtimeUpdates();
    }
  }

  ngOnDestroy(): void {
    if (this.scoreSub) {
      this.scoreSub.unsubscribe();
    }
  }

  loadMatch(id: string): void {
    this.matchService.getMatchById(id).subscribe({
      next: (data) => {
        this.match = data;
        // Default to scorecard tab if match is live/completed and has data
        if (this.match.scorecard) {
          this.activeTab = 'scorecard';
        }
      },
      error: (err) => console.error('Error loading match', err)
    });
  }

  setupRealtimeUpdates(): void {
    this.scoreSub = this.socketService.onEvent('score_update').subscribe((updatedMatch: any) => {
      if (updatedMatch.matchId === this.matchId) {
        // Merge updates carefully to avoid overwriting detailed data with partial updates if any
        this.match = { ...this.match, ...updatedMatch };
      }
    });
  }

  parseDismissal(dismissal: string, batsmanName: string): any[] {
    const parts: any[] = [];
    if (!dismissal) return parts;

    // Trim input
    dismissal = dismissal.trim();

    // Check for "Batting" or "not out"
    if (dismissal === 'Batting' || dismissal === 'not out') {
      parts.push({ type: 'icon', value: 'bat', title: 'Batting' });
      // Logic for striker (asterisk check)
      if (batsmanName && batsmanName.includes('*')) {
        parts.push({ type: 'icon', value: 'ball_small', title: 'On Strike' });
      }
      return parts;
    }

    // Pattern: c Fielder b Bowler
    // Let's use a regex to find keywords and split
    const regex = /\b(c |b |lbw|run out)\b/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(dismissal)) !== null) {
      // Text before the match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: dismissal.substring(lastIndex, match.index) });
      }

      // The keyword
      const keyword = match[0].trim();
      if (keyword === 'c') {
        parts.push({ type: 'icon', value: 'hand', title: 'Caught' });
      } else if (keyword === 'b') {
        parts.push({ type: 'icon', value: 'ball', title: 'Bowled' });
      } else if (keyword === 'lbw') {
        parts.push({ type: 'icon', value: 'stumps', title: 'LBW' });
      } else if (keyword === 'run out') {
        parts.push({ type: 'icon', value: 'stumps', title: 'Run Out' });
      }

      lastIndex = regex.lastIndex;
    }

    // Remaining text
    if (lastIndex < dismissal.length) {
      parts.push({ type: 'text', value: dismissal.substring(lastIndex) });
    }

    return parts;
  }

  get currentBatsmen(): any[] {
    if (!this.match?.scorecard?.batting) return [];
    return this.match.scorecard.batting.filter((b: any) =>
      b.dismissal === 'Batting' ||
      b.dismissal === 'not out' ||
      b.batsman.includes('*')
    );
  }

  get currentBowlers(): any[] {
    if (!this.match?.scorecard?.bowling) return [];

    const bowlers = this.match.scorecard.bowling;

    // 1. Check for bowler with incomplete over (e.g., 1.3, 2.5)
    // Note: 'overs' is a string like "2.0" or "1.3"
    const activeBowler = bowlers.find((b: any) => {
      const parts = b.overs.toString().split('.');
      if (parts.length > 1) {
        const balls = parseInt(parts[1], 10);
        return balls > 0 && balls < 6;
      }
      return false;
    });

    if (activeBowler) {
      return [activeBowler];
    }

    // 2. If all overs are complete, it's ambiguous.
    // Usually the last bowler in the list is the most recent one.
    return bowlers.length > 0 ? [bowlers[bowlers.length - 1]] : [];
  }

  calculateRunRate(score: string, overs: string): string {
    if (!score || !overs) return '0.00';
    const runs = parseInt(score.split('/')[0], 10);
    const ov = parseFloat(overs);
    if (isNaN(runs) || isNaN(ov) || ov === 0) return '0.00';
    return (runs / ov).toFixed(2);
  }

  commentaryFilter: string = 'All';

  setFilter(filter: string): void {
    this.commentaryFilter = filter;
  }

  get filteredCommentary(): any[] {
    if (!this.match?.commentary) return [];

    const allComm = this.match.commentary;

    switch (this.commentaryFilter) {
      case 'Highlights':
        // Example logic for highlights: events that are not dots/singles
        return allComm.filter((c: any) => c.score === '4' || c.score === '6' || c.isWicket);
      case 'Overs':
        // Showing only end of overs? or just grouping
        // Maybe just return all, logic is handled in template, OR filter for 'start/end' of overs
        // Let's filter for just the over summaries? 
        // Based on UI buttons, 'Overs' likely means Over summaries or similar.
        // But standard implementations usually show "Wickets" and "Boundaries".
        // Let's assume 'Overs' might filter to show the last ball of each over.
        return allComm.filter((_: any, i: number) => this.isNewOver(allComm[i], i));
      case 'W':
        return allComm.filter((c: any) => c.isWicket);
      case '6s':
        return allComm.filter((c: any) => c.score === '6');
      case '4s':
        return allComm.filter((c: any) => c.score === '4');
      case 'All':
      default:
        return allComm;
    }
  }

  isNewOver(current: any, index: number): boolean {
    if (index === 0) return true;

    // Safety check if we are filtering:
    // This logic relies on the full list index. If filtering, "index-1" might correspond to a completely different over.
    // However, if we are in "All" view, it works.
    // If we are in "Wicket" view, we probably don't want "New Over" headers unless the wicket was the first ball?
    // Let's rely on the template iterating over 'filteredCommentary' and passing the filtered index?
    // Actually, headers usually only show in "All" or "Overs" view.
    if (this.commentaryFilter !== 'All') return false;

    const prev = this.match.commentary[index - 1]; // This is risky if passing filtered index.
    // Ideally the template loop variable 'comm' and 'i' refers to filtered list.
    // So 'prev' should be filteredCommentary[index-1]

    return false; // See updated logic below
  }

  // Updated helper that takes the list being iterated
  showOverHeader(item: any, prevItem: any): boolean {
    if (this.commentaryFilter !== 'All') return false;
    if (!prevItem) return true; // First item always shows header in All view
    return item.over !== prevItem.over;
  }

  getBallClass(ball: string): string {
    const b = (ball || '').toLowerCase().trim();
    if (b === 'over') return 'over';
    if (b === 'ball' || b === 'live') return 'ball-live';
    if (b.includes('w')) return 'wicket';
    if (b === '4' || b.includes('4')) return 'four';
    if (b === '6' || b.includes('6')) return 'six';
    if (b === '0' || b === 'dot') return 'dot';
    return 'run';
  }

  get isWomenMatch(): boolean {
    if (!this.match) return false;
    const t1 = (this.match.team1 || '').toLowerCase();
    const t2 = (this.match.team2 || '').toLowerCase();
    // Keywords and patterns to identify women's match
    // Matches "women", "wmn", "ladies", "girls", "-w", "(w)", "w-a", etc.
    const patterns = [
      /\bwomen\b/, /\bwmn\b/, /\bladies\b/, /\bgirls\b/,
      /-w\b/, /\(w\)/, /w-/, /-w-/
    ];
    return patterns.some(p => p.test(t1) || p.test(t2));
  }

  getPlayerAvatar(): string {
    if (this.isWomenMatch) {
      // Female Avatar
      return 'https://www.w3schools.com/howto/img_avatar2.png';
    } else {
      // Male Avatar
      return 'https://www.w3schools.com/howto/img_avatar.png';
    }
  }
}
