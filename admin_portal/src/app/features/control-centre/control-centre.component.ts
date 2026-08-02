import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, SystemSettings } from '../../core/services/settings.service';

@Component({
  selector: 'app-control-centre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-centre.component.html',
  styleUrls: ['./control-centre.component.scss'],
})
export class ControlCentreComponent implements OnInit {
  settings: SystemSettings | null = null;
  loading = true;
  toggling = false;

  disableReason = '';
  showReasonInput = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.load().subscribe({
      next: s => { this.settings = s; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onToggle(): void {
    if (!this.settings) return;
    const enabling = !this.settings.workerPortalEnabled;

    // Turning OFF → ask for optional reason first
    if (!enabling) {
      this.showReasonInput = true;
      return;
    }

    this.doToggle(true);
  }

  confirmDisable(): void {
    this.doToggle(false, this.disableReason || undefined);
    this.showReasonInput = false;
    this.disableReason = '';
  }

  cancelDisable(): void {
    this.showReasonInput = false;
    this.disableReason = '';
  }

  private doToggle(enabled: boolean, reason?: string): void {
    this.toggling = true;
    this.settingsService.toggleWorkerPortal(enabled, reason).subscribe({
      next: s => { this.settings = s; this.toggling = false; },
      error: () => { this.toggling = false; },
    });
  }

  get workerPortalOn(): boolean {
    return this.settings?.workerPortalEnabled ?? false;
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
