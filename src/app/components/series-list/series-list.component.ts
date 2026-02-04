import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-series-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './series-list.component.html',
  styleUrls: ['./series-list.component.scss']
})
export class SeriesListComponent implements OnInit {
  series: any[] = [];
  groupedSeries: { month: string, series: any[] }[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getSeries().subscribe({
      next: (data) => {
        this.series = data;
        this.groupSeriesByMonth();
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      }
    });
  }

  groupSeriesByMonth() {
      this.groupedSeries = [];
      this.series.forEach(s => {
          const month = s.month || 'Upcoming';
          const lastGroup = this.groupedSeries[this.groupedSeries.length - 1];
          if (lastGroup && lastGroup.month === month) {
              lastGroup.series.push(s);
          } else {
              this.groupedSeries.push({ month, series: [s] });
          }
      });
  }
}
