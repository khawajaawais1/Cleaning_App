import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EarningsService } from '../../core/services/earnings.service';
import { EarningRecord, EarningsSummary } from '../../core/models/earnings.model';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss'],
})
export class EarningsComponent implements OnInit {
  summary: EarningsSummary | null = null;
  history: EarningRecord[] = [];
  loading = true;

  constructor(private earningsService: EarningsService) {}

  ngOnInit(): void {
    this.earningsService.getSummary().subscribe(s => this.summary = s);
    this.earningsService.getHistory().subscribe(h => {
      this.history = h;
      this.loading = false;
    });
  }

  get pendingRecords(): EarningRecord[] {
    return this.history.filter(e => e.status === 'pending');
  }

  get paidRecords(): EarningRecord[] {
    return this.history.filter(e => e.status === 'paid');
  }
}
