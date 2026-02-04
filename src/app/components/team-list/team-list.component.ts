import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
  teams: any[] = [];
  filteredTeams: any[] = [];
  loading = true;
  searchTerm: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTeams().subscribe({
      next: (data) => {
        this.teams = data;
        this.filteredTeams = data;
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredTeams = this.teams;
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredTeams = this.teams.filter(t => 
        t.name.toLowerCase().includes(term)
      );
    }
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/images/default-team-logo.png';
  }
}
