import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PricingService, ServiceRate, PlatformFee } from '../../core/services/pricing.service';

interface RateRow extends ServiceRate {
  editing: boolean;
  draft: Partial<ServiceRate>;
  saving: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent implements OnInit {
  rates: RateRow[] = [];
  platformFee: PlatformFee | null = null;
  loading = true;
   private LocalIcons: Record<string, string> = {
    StandardClean: "service-1.svg",
    DeepClean: "service-2.svg",
    OfficeClean: "service-3.svg",
    MoveInOut: "service-4.svg"
  };

  // Platform fee edit state
  editingFee = false;
  feeDraft = { fee: 5, feeType: 'flat' as 'flat' | 'percent' };
  savingFee = false;

  // Add new service modal
  showAddModal = false;
  addForm = { serviceType: '', label: '', tagline: '', icon: 'new-service.svg', ratePerHour: 25, displayOrder: 99 };
  adding = false;
  addError = '';

  // Delete confirm
  deletingId: number | null = null;

  constructor(private pricingService: PricingService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.pricingService.getRates().subscribe(rates => {
      this.rates = rates.map(r => ({ ...r, editing: false, draft: {}, saving: false, icon: this.LocalIcons[r.serviceType]  }));
      this.loading = false;
    });
    this.pricingService.getPlatformFee().subscribe(f => {
      this.platformFee = f;
      this.feeDraft = { fee: f.fee, feeType: f.feeType };
    });
  }

  /* ── Service rate inline edit ── */
  startEdit(row: RateRow): void {
    row.draft = { label: row.label, tagline: row.tagline, icon: row.icon, ratePerHour: row.ratePerHour };
    row.editing = true;
  }

  cancelEdit(row: RateRow): void {
    row.editing = false;
    row.draft = {};
  }

  saveRate(row: RateRow): void {
    row.saving = true;
    this.pricingService.updateRate(row.id, row.draft).subscribe({
      next: updated => {
        Object.assign(row, updated, { editing: false, draft: {}, saving: false });
      },
      error: () => { row.saving = false; }
    });
  }

  toggleActive(row: RateRow): void {
    row.saving = true;
    this.pricingService.updateRate(row.id, { isActive: !row.isActive }).subscribe({
      next: updated => { Object.assign(row, updated, { saving: false }); },
      error: () => { row.saving = false; }
    });
  }

  /* ── Delete ── */
  confirmDelete(id: number): void { this.deletingId = id; }
  cancelDelete(): void { this.deletingId = null; }

  doDelete(): void {
    if (!this.deletingId) return;
    const id = this.deletingId;
    this.deletingId = null;
    this.pricingService.deleteRate(id).subscribe(() => {
      this.rates = this.rates.filter(r => r.id !== id);
    });
  }

  /* ── Add new service ── */
  openAdd(): void {
    this.addForm = { serviceType: '', label: '', tagline: '', icon: 'new-service.svg', ratePerHour: 25, displayOrder: (this.rates.length + 1) * 10 };
    this.addError = '';
    this.showAddModal = true;
  }

  submitAdd(): void {
    if (!this.addForm.serviceType || !this.addForm.label) { this.addError = 'Service type and label are required.'; return; }
    this.adding = true;
    this.pricingService.createRate({ ...this.addForm, isActive: true }).subscribe({
      next: created => {
        this.rates.push({ ...created, editing: false, draft: {}, saving: false });
        this.rates.sort((a, b) => a.displayOrder - b.displayOrder);
        this.adding = false;
        this.showAddModal = false;
      },
      error: (err) => {
        this.addError = err.error?.message ?? 'Failed to create service.';
        this.adding = false;
      }
    });
  }

  /* ── Platform fee ── */
  startEditFee(): void {
    this.feeDraft = { fee: this.platformFee!.fee, feeType: this.platformFee!.feeType };
    this.editingFee = true;
  }

  saveFee(): void {
    this.savingFee = true;
    this.pricingService.updatePlatformFee(this.feeDraft.fee, this.feeDraft.feeType).subscribe({
      next: f => { this.platformFee = f; this.savingFee = false; this.editingFee = false; },
      error: () => { this.savingFee = false; }
    });
  }

  feeLabel(f: PlatformFee): string {
    return f.feeType === 'flat' ? `€${f.fee} flat` : `${f.fee}% of subtotal`;
  }
}
