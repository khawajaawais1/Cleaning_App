import {
  Component, OnInit, OnDestroy, Input,
  ChangeDetectorRef, NgZone, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { loadStripe, Stripe, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  @Input() bookingId!: number;
  @Input() amount!: number;
  @Input() publishableKey!: string;
  @Input() clientSecret!: string;

  modal = inject(NgbActiveModal);
  private cdr   = inject(ChangeDetectorRef);
  private zone  = inject(NgZone);

  useNewCard = false;
  cardholderName = '';
  processing = false;
  error = '';

  cardDisplay = '•••• •••• •••• ••••';
  cardExpiry  = 'MM / YY';

  private stripe: Stripe | null = null;
  private cardNumber: StripeCardNumberElement | null = null;
  private cardExpEl:  StripeCardExpiryElement | null = null;
  private cardCvc:    StripeCardCvcElement    | null = null;

  ngOnInit(): void {}

  async mountStripeElements(): Promise<void> {
    if (this.stripe) return; // already mounted
    this.stripe = await loadStripe(this.publishableKey);
    if (!this.stripe) return;

    const elements = this.stripe.elements();
    const base = {
      style: {
        base: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '15px',
          color: '#1a231e',
          '::placeholder': { color: '#aab8b2' },
        },
        invalid: { color: '#e53e3e' },
      },
    };

    this.cardNumber = elements.create('cardNumber', base);
    this.cardExpEl  = elements.create('cardExpiry', base);
    this.cardCvc    = elements.create('cardCvc', base);

    this.cardNumber.mount('#card-number-el');
    this.cardExpEl.mount('#card-expiry-el');
    this.cardCvc.mount('#card-cvc-el');

    // Live preview
    this.cardNumber.on('change', (e: any) => {
      this.zone.run(() => {
        const v = e.value?.cardNumber ?? '';
        this.cardDisplay = v
          ? v.replace(/(.{4})/g, '$1 ').trim()
          : '•••• •••• •••• ••••';
        this.cdr.markForCheck();
      });
    });
    this.cardExpEl.on('change', (e: any) => {
      this.zone.run(() => {
        this.cardExpiry = e.value?.expiry ?? 'MM / YY';
        this.cdr.markForCheck();
      });
    });
  }

  async onNewCardToggle(): Promise<void> {
    this.useNewCard = true;
    this.cdr.detectChanges();
    // defer one tick so the DOM elements are rendered
    setTimeout(() => this.mountStripeElements(), 50);
  }

  async pay(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    this.error = '';

    try {
      if (this.useNewCard) {
        // Pay with newly entered card via Stripe Elements
        if (!this.stripe || !this.cardNumber) {
          this.error = 'Card fields not ready. Please try again.';
          this.processing = false;
          return;
        }
        const result = await this.stripe.confirmCardPayment(this.clientSecret, {
          payment_method: {
            card: this.cardNumber,
            billing_details: { name: this.cardholderName || 'Customer' },
          },
        });
        if (result.error) {
          this.error = result.error.message ?? 'Payment failed.';
          this.processing = false;
          return;
        }
        this.modal.close({ paymentIntentId: result.paymentIntent?.id });
      } else {
        // Use mock saved Visa card (Stripe test payment method)
        const result = await this.stripe!.confirmCardPayment(this.clientSecret, {
          payment_method: 'pm_card_visa',
        });
        if (result.error) {
          this.error = result.error.message ?? 'Payment failed.';
          this.processing = false;
          return;
        }
        this.modal.close({ paymentIntentId: result.paymentIntent?.id });
      }
    } catch (e: any) {
      this.error = e?.message ?? 'An unexpected error occurred.';
      this.processing = false;
    }
  }

  ngOnDestroy(): void {
    this.cardNumber?.destroy();
    this.cardExpEl?.destroy();
    this.cardCvc?.destroy();
  }
}
