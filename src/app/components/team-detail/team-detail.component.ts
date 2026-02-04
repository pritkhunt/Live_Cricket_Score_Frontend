import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamDetailComponent implements OnInit {
  team: any = null;
  teamMatches: any[] | null = null;
  teamNews: any[] | null = null;
  loading = true;
  activeTab: 'overview' | 'matches' | 'news' = 'overview';
  slug: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}


  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('id');
    if (slug) {
        this.slug = slug;
        this.fetchOverview(slug);
    }
  }

  fetchOverview(slug: string): void {
      this.loading = true;
      this.apiService.getTeamDetail(slug).subscribe({
            next: (data) => {
                this.team = data;
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
      this.apiService.getTeamMatches(slug).subscribe({
          next: (data) => {
              this.teamMatches = data;
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
      this.apiService.getTeamNews(slug).subscribe({
          next: (data) => {
              this.teamNews = data;
              this.loading = false;
          },
          error: (e) => {
              console.error(e);
              this.loading = false;
          }
      });
  }

  switchTab(tab: 'overview' | 'matches' | 'news'): void {
      this.activeTab = tab;
      if (this.slug) {
          if (tab === 'overview' && !this.team) this.fetchOverview(this.slug);
          if (tab === 'matches' && !this.teamMatches) this.fetchMatches(this.slug);
          if (tab === 'news' && !this.teamNews) this.fetchNews(this.slug);
      }
  }
}
