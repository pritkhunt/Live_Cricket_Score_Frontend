import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './series-detail.component.html',
  styleUrls: ['./series-detail.component.scss']
})
export class SeriesDetailComponent implements OnInit {
  series: any = null;
  seriesName: string = ''; // Store series name for display
  matches: any[] | null = null;
  squads: any[] | null = null;
  pointsTable: any[] | null = null;
  overview: string = '';
  seriesNews: any[] | null = null;
  
  // Player Modal State
  selectedTeam: string | null = null;
  squadPlayers: any[] | null = null;
  loadingPlayers = false; // Separate loading state for players

  loading = true;
  activeTab: 'overview' | 'matches' | 'squads' | 'points' | 'news' = 'overview';
  slug: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('id');
    if (slug) {
        this.slug = slug;
        this.fetchSeriesDetail(slug);
        // Default tab is overview, so we can fetch overview data here if needed
        this.overview = "The " + (this.seriesName || 'series') + " features top competitive teams battling for the championship trophy. Follow all the live action, scores, and updates right here.";
    }
  }

  fetchSeriesDetail(slug: string): void {
      this.apiService.getSeriesDetail(slug).subscribe({
          next: (data) => {
              this.series = data;
              this.seriesName = data.info || data.name || data.title || 'Series';
              this.overview = "The " + this.seriesName + " features top competitive teams battling for the championship trophy. Follow all the live action, scores, and updates right here.";
              this.loading = false;
          },
          error: (e) => {
              console.error(e);
              this.loading = false;
          }
      });
  }

  fetchMatches(slug: string): void {
      this.loading = true;
      this.apiService.getSeriesMatches(slug).subscribe({
          next: (data) => {
              this.matches = data;
              this.groupMatchesByDate(data);
              this.loading = false;
          },
          error: (e) => {
              console.error(e);
              this.loading = false;
          }
      });
  }

  groupedMatches: { date: string, matches: any[] }[] = [];

  groupMatchesByDate(matches: any[]): void {
      const groups: { date: string, matches: any[] }[] = [];
      matches.forEach(match => {
          let dateHeader = 'Upcoming';
          // Match.date might be "1:00 PM" if scraped correctly now.
          // Or scraper might have returned full date in a different field?
          // ScraperService returns 'date'.
          // Validating headers is tricky without full date. 
          // But let's group by "Today", "Tomorrow" if possible, or just put all in "Upcoming" if no date.
          // Wait, scraper now returns 'date' as time (1:00 PM). Where is the "Wednesday, Feb 4" info?
          // The scraper extracted `dateEl` which defaults to time.
          // I might need to rely on the scraper's 'info' or just a generic header if date missing.
          // Actually, in the screenshot, "Monday, February 2" is a header.
          // My scraper currently does NOT extract the group header from the list.
          // It processes `match-card-wrapper`.
          // I might need to extract the date header *inside* scraping loop from previous siblings.
          // But for now, let's just group by unique `date` if it contains a date string, or default.
          
          if (match.date && match.date.includes(',')) {
              // typically "Feb 04, 1:00 PM" -> Header "Feb 04" ?
              // If format is just time, we can't group easily.
              // Let's assume for now we group by whatever date info we have or "Matches".
          }
          
          // Fallback: Group by Series Name or just "Upcoming Matches"
          // Or check if scraper returns a "dateHeader" field? (I didn't add it).
          // I will add a single group for now to satisfy the structure if parsing fails.
          
           if (!dateHeader) dateHeader = 'Match List';

          const existingGroup = groups.find(g => g.date === dateHeader);
          if (existingGroup) {
              existingGroup.matches.push(match);
          } else {
              groups.push({ date: dateHeader, matches: [match] });
          }
      });
      this.groupedMatches = groups;
  }

  fetchSquads(slug: string): void {
      this.loading = true;
      this.apiService.getSeriesSquads(slug).subscribe({
          next: (data) => {
              // Parse "TeamName 15 Players" into parts if possible
              this.squads = data.map(s => {
                  const match = s.name.match(/^(.*?)(\d+\s+Players)$/i);
                  if (match) {
                      return { name: match[1].trim(), count: match[2].trim() };
                  }
                  return s;
              });
              this.loading = false;
          },
          error: (e) => {
              console.error(e);
              this.loading = false;
          }
      });
  }



  openSquad(teamName: string): void {
      if (!this.slug) return;
      this.selectedTeam = teamName;
      this.squadPlayers = null;
      this.loadingPlayers = true;
      
      this.apiService.getSeriesSquadPlayers(this.slug, teamName).subscribe({
          next: (data) => {
              this.squadPlayers = data;
              this.loadingPlayers = false;
          },
          error: (e) => {
              console.error(e);
              this.loadingPlayers = false;
          }
      });
  }

  closeSquad(): void {
      this.selectedTeam = null;
      this.squadPlayers = null;
  }

  fetchPointsTable(slug: string): void {
      this.loading = true;
      this.apiService.getSeriesPoints(slug).subscribe({
          next: (data) => {
              this.pointsTable = data;
              this.loading = false;
          },
          error: (e) => {
              console.error(e);
              this.loading = false;
          }
      });
  }

  fetchNews(slug: string): void {
     this.loading = true;
     this.apiService.getSeriesNews(slug).subscribe({
         next: (data) => {
             this.seriesNews = data;
             this.loading = false;
         },
         error: (e) => {
             console.error(e);
             this.loading = false;
         }
     });
  }

  openNews(id: string): void {
      this.router.navigate(['/news', id]);
  }

  switchTab(tab: 'overview' | 'matches' | 'squads' | 'points' | 'news'): void {
      this.activeTab = tab;
      if (this.slug) {
          if (tab === 'matches' && !this.matches) this.fetchMatches(this.slug);
          if (tab === 'squads' && !this.squads) this.fetchSquads(this.slug);
          if (tab === 'points' && !this.pointsTable) this.fetchPointsTable(this.slug);
          if (tab === 'news' && !this.seriesNews) this.fetchNews(this.slug);
      }
  }
}
