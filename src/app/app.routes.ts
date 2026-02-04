import { Routes } from '@angular/router';
import { MatchListComponent } from './components/match-list/match-list.component';
import { MatchDetailComponent } from './components/match-detail/match-detail.component';

import { SeriesListComponent } from './components/series-list/series-list.component';
import { TeamListComponent } from './components/team-list/team-list.component';
import { NewsListComponent } from './components/news-list/news-list.component';

import { NewsDetailComponent } from './components/news-detail/news-detail.component';
import { SeriesDetailComponent } from './components/series-detail/series-detail.component';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/matches', pathMatch: 'full' },
  { path: 'matches', component: MatchListComponent },
  { path: 'matches/:id', component: MatchDetailComponent },
  { path: 'series', component: SeriesListComponent },
  { path: 'series/:id', component: SeriesDetailComponent },
  { path: 'teams', component: TeamListComponent },
  { path: 'teams/:id', component: TeamDetailComponent },
  { path: 'news', component: NewsListComponent },
  { path: 'news/:id', component: NewsDetailComponent },
];
