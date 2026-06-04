import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';

const TAGS = ['Punctual','Thorough','Friendly','Efficient','Professional','Communicative','Careful','Detail-oriented'];

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent implements OnInit {
  booking: any = null;
  receipt: any = null;
  loading = true;
  submitted = false;
  submitting = false;

  rating = 0;
  hoverRating = 0;
  selectedTags: string[] = [];
  reviewText = '';
  selectedTip = 0;
  readonly tags = TAGS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingSvc: BookingService,
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.bookingSvc.getBookingById(id).subscribe({
      next: (b) => {
        this.booking = b;
        if (b.customerRating) {
          this.rating = b.customerRating;
          this.reviewText = b.customerReview ?? '';
          this.submitted = true;
        }
        this.loadReceipt(id);
      },
      error: () => { this.loading = false; },
    });
  }

  private loadReceipt(id: number): void {
    this.bookingSvc.getReceipt(id).subscribe({
      next: (r) => { this.receipt = r; this.loading = false; },
      error: ()  => { this.loading = false; },
    });
  }

  toggleTag(tag: string): void {
    const i = this.selectedTags.indexOf(tag);
    if (i > -1) this.selectedTags.splice(i, 1);
    else this.selectedTags.push(tag);
  }
  isTagSelected(tag: string): boolean { return this.selectedTags.includes(tag); }

  get stars(): number[] { return [1,2,3,4,5]; }
  get displayRating(): number { return this.hoverRating || this.rating; }

  submitReview(): void {
    if (this.rating === 0 || this.submitting) return;
    this.submitting = true;
    this.bookingSvc.submitReview(this.booking.id, this.rating, this.reviewText, this.selectedTags).subscribe({
      next:  () => { this.submitted = true; this.submitting = false; },
      error: () => { this.submitting = false; },
    });
  }

  get workerFirstName(): string {
    return this.booking?.worker?.fullName?.split(' ')[0] ?? 'your cleaner';
  }

  get scheduledLabel(): string {
    if (!this.booking?.scheduledAt) return '';
    const d = new Date(this.booking.scheduledAt);
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
  }

  get durationLabel(): string {
    const m = this.booking?.durationMinutes ?? 0;
    const h = Math.floor(m / 60); const min = m % 60;
    return min > 0 ? `${h}h ${min}m` : `${h}h`;
  }

  downloadPdf(): void {
    window.print();
  }

  get invoiceTotal(): number { return (this.receipt?.price ?? 0) + (this.receipt?.platformFee ?? 0); }
}
