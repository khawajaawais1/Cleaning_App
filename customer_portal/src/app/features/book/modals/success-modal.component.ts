import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModalComponent implements OnInit {
  @Input() bookingNumber = '';
  @Input() serviceName = '';
  @Input() scheduledDate = '';
  @Input() amount = 0;

  modal = inject(NgbActiveModal);

  ngOnInit(): void {
    this.launchConfetti();
  }

  private launchConfetti(): void {
    const colors = ['#25ae59', '#1d8a47', '#a7f3c4', '#ffffff', '#1a231e'];

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.6 },
        colors,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2,  { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1,  { spread: 120, startVelocity: 45 });
  }

  close(): void {
    this.modal.close('navigate');
  }
}
