import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveScore } from './live-score';

describe('LiveScore', () => {
  let component: LiveScore;
  let fixture: ComponentFixture<LiveScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveScore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveScore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
