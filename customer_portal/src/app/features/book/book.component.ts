import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  NgZone,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {
  loadStripe,
  Stripe,
  StripeCardNumberElement,
  StripeCardExpiryElement,
  StripeCardCvcElement,
} from "@stripe/stripe-js";
import confetti from "canvas-confetti";
import { AuthService } from "../../core/services/auth.service";
import { GeocodingService } from "../../core/services/geocoding.service";
import { BookingService } from "../../core/services/booking.service";
import { PaymentService, SavedCard } from "../../core/services/payment.service";
import { ServiceOption } from "../../core/models/booking.model";
import { PricingService } from "../../core/services/pricing.service";

interface AddOn {
  id: string;
  label: string;
  desc: string;
  price: number;
  icon: string;
  enabled: boolean;
}

interface QuickTag {
  icon: string;
  label: string;
  active: boolean;
}
interface CalDay {
  day: number | null;
  isPast: boolean;
  isToday: boolean;
}
interface PreviewImage {
  file: File;
  url: string;
}

@Component({
  selector: "app-book",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./book.component.html",
  styleUrls: ["./book.component.scss"],
})
export class BookComponent implements OnInit {
  // ── ng-template refs ─────────────────────────────────────
  @ViewChild("paymentTpl") paymentTpl!: TemplateRef<any>;
  @ViewChild("confirmTpl") confirmTpl!: TemplateRef<any>;

  // ── Step 1: Service ───────────────────────────────────────
  step = 1;
  services: ServiceOption[] = [];
  selectedService: ServiceOption | null = null;
  private LocalIcons: Record<string, string> = {
    StandardClean: "service-1.svg",
    DeepClean: "service-2.svg",
    OfficeClean: "service-3.svg",
    MoveInOut: "service-4.svg"
  };
  /* private LocalImages: Record<string, string> = {
    StandardClean: "clean-1.png",
    DeepClean: "clean-2.png",
    OfficeClean: "clean-3.png",
    MoveInOut: "clean-4.png"
  }; */

  // ── Step 2: Address & Schedule ────────────────────────────
  street = "";
  apt = "";
  city = "Helsinki";
  postcode = "";
  selectedHours = 3;
  readonly hoursOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  calYear = new Date().getFullYear();
  calMonth = new Date().getMonth();
  calDays: CalDay[] = [];
  readonly calHeaders = ["M", "T", "W", "T", "F", "S", "S"];
  selectedDay: number | null = null;
  selectedTime = "";
  timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
  ];

  // ── Step 3: Add-ons ───────────────────────────────────────
  addOns: AddOn[] = [
    {
      id: "oven",
      label: "Inside oven",
      desc: "Full degreasing",
      price: 15,
      icon: "inside-oven.svg",
      enabled: false,
    },
    {
      id: "fridge",
      label: "Inside fridge",
      desc: "Shelves & door seals",
      price: 10,
      icon: "inside-fridge.svg",
      enabled: false,
    },
    {
      id: "laundry",
      label: "Laundry (1 load)",
      desc: "Wash, dry & fold",
      price: 8,
      icon: "laundry.svg",
      enabled: false,
    },
    {
      id: "windows",
      label: "Window cleaning",
      desc: "Interior windows",
      price: 12,
      icon: "window-cleaning.svg",
      enabled: false,
    },
    {
      id: "ironing",
      label: "Ironing (1 hour)",
      desc: "Clothes & linens",
      price: 18,
      icon: "iron.svg",
      enabled: false,
    },
  ];

  // ── Step 4: Notes & Photos ────────────────────────────────
  notes = "";
  quickTags: QuickTag[] = [
    { icon: "eco", label: "Eco products", active: false },
    { icon: "pets", label: "Pet inside", active: false },
    { icon: "key", label: "Lockbox key", active: false },
    { icon: "dark_mode", label: "Baby sleeping", active: false },
    { icon: "household_supplies", label: "Bring equipment", active: false },
    { icon: "household_supplies", label: "Use own supplies", active: false },
  ];
  images: PreviewImage[] = [];
  photoCount = 0;
  readonly MAX_FILES = 8;

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    const files = Array.from(input.files);

    // remaining slots available
    const remainingSlots = this.MAX_FILES - this.images.length;

    if (remainingSlots <= 0) {
      alert("You can only upload up to 8 images.");
      input.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();

      reader.onload = () => {
        this.images.push({
          file,
          url: reader.result as string,
        });

        // update count AFTER successful push
        this.photoCount = this.images.length;
      };

      reader.readAsDataURL(file);
    });

    // optional warning if user selected more than allowed
    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} images were added (max 8 allowed).`);
    }

    // reset input
    input.value = "";
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    this.photoCount--;
  }

  // ── Step 5 (Confirm) state ────────────────────────────────
  loading = false;
  error = "";
  savedCard: SavedCard | null = null;
  loadingCard = false;

  // ── Payment modal state ───────────────────────────────────
  cardholderName = "";
  payProcessing = false;
  payError = "";
  cardNumDisplay = "•••• •••• •••• ••••";
  cardExpDisplay = "MM / YY";
  private stripe: Stripe | null = null;
  private stripeCardN: StripeCardNumberElement | null = null;
  private stripeCardE: StripeCardExpiryElement | null = null;
  private stripeCardC: StripeCardCvcElement | null = null;

  // ── Confirmation modal state ──────────────────────────────
  confirmedBooking: any = null;

  // ── Sidebar context ───────────────────────────────────────
  sideCtx: Record<
    number,
    { eyebrow: string; line1: string; accent: string; desc: string }
  > = {
    1: {
      eyebrow: "STEP 2 OF 8",
      line1: "Pick your ",
      accent: "perfect clean.",
      desc: "From a quick standard tidy to a full deep clean — choose the service that fits your home.",
    },
    2: {
      eyebrow: "STEP 3 OF 8",
      line1: "Tell us ",
      accent: "where & when.",
      desc: "We'll match you with a verified cleaner available at your chosen time, within your area.",
    },
    3: {
      eyebrow: "STEP 4 OF 8",
      line1: "Make it ",
      accent: "extra special.",
      desc: "Add extras like oven cleaning or laundry to get the most out of your booking.",
    },
    4: {
      eyebrow: "STEP 5 OF 8",
      line1: "Help them ",
      accent: "prepare.",
      desc: "A quick note or photo helps your cleaner arrive ready — resulting in a faster, better clean.",
    },
    5: {
      eyebrow: "STEP 6 OF 8",
      line1: "Almost ",
      accent: "there.",
      desc: "Review your booking details and confirm. Your card is only charged after the job is complete.",
    },
  };

  // ── DI ────────────────────────────────────────────────────
  readonly auth = inject(AuthService);
  private bookingSvc = inject(BookingService);
  private paymentSvc = inject(PaymentService);
  private geoSvc = inject(GeocodingService);
  private pricingSvc = inject(PricingService);
  private modalSvc = inject(NgbModal);
  private router = inject(Router);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  // Geocoded coordinates (set when leaving the address step)
  private bookingLat: number | undefined;
  private bookingLng: number | undefined;

  // ── Computed ──────────────────────────────────────────────
  get activeAddOnLabels(): string {
    return this.addOns
      .filter((a) => a.enabled)
      .map((a) => a.label)
      .join(" · ");
  }
  get activeTagLabels(): string {
    return this.quickTags
      .filter((t) => t.active)
      .map((t) => t.label)
      .join(" · ");
  }
  get combinedNotes(): string {
    return [this.notes, this.activeTagLabels]
      .filter((s) => s.length > 0)
      .join(" · ");
  }
  get durationHours(): number {
    return this.selectedHours;
  }
  get basePrice(): number {
    return (this.selectedService?.ratePerHour ?? 0) * this.durationHours;
  }
  get addOnTotal(): number {
    return this.addOns
      .filter((a) => a.enabled)
      .reduce((s, a) => s + a.price, 0);
  }
  get platformFee(): number {
    return this.pricingSvc.calcPlatformFee(this.basePrice + this.addOnTotal);
  }
  get total(): number {
    return this.basePrice + this.addOnTotal + this.platformFee;
  }
  get cardBrandUpper(): string {
    return (this.savedCard?.brand ?? "").toUpperCase();
  }

  ngOnInit(): void {
    this.buildCalendar();
    /* this.pricingSvc.rates$.subscribe((r) => (this.services = r)); */
    this.pricingSvc.rates$.subscribe((rates) => {
      this.services = rates.map((service) => ({
        ...service,
        icon: this.LocalIcons[service.type] || "default.svg",
      }));
    });
  }

  // ── Calendar ──────────────────────────────────────────────
  get calMonthLabel(): string {
    return new Date(this.calYear, this.calMonth, 1).toLocaleDateString(
      "en-GB",
      { month: "long", year: "numeric" },
    );
  }
  buildCalendar(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const first = new Date(this.calYear, this.calMonth, 1);
    const last = new Date(this.calYear, this.calMonth + 1, 0);
    let dow = first.getDay();
    dow = dow === 0 ? 6 : dow - 1;
    this.calDays = [];
    for (let i = 0; i < dow; i++)
      this.calDays.push({ day: null, isPast: false, isToday: false });
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(this.calYear, this.calMonth, d);
      this.calDays.push({
        day: d,
        isPast: dt < today,
        isToday: dt.getTime() === today.getTime(),
      });
    }
    while (this.calDays.length % 7 !== 0)
      this.calDays.push({ day: null, isPast: false, isToday: false });
  }
  prevMonth(): void {
    if (this.calMonth === 0) {
      this.calMonth = 11;
      this.calYear--;
    } else this.calMonth--;
    this.selectedDay = null;
    this.buildCalendar();
  }
  nextMonth(): void {
    if (this.calMonth === 11) {
      this.calMonth = 0;
      this.calYear++;
    } else this.calMonth++;
    this.selectedDay = null;
    this.buildCalendar();
  }
  selectDay(c: CalDay): void {
    if (!c.day || c.isPast) return;
    this.selectedDay = c.day;
  }
  get selectedDateLabel(): string {
    if (!this.selectedDay) return "";
    return new Date(
      this.calYear,
      this.calMonth,
      this.selectedDay,
    ).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  // ── Navigation ────────────────────────────────────────────
  nextStep(): void {
    this.error = "";
    if (this.step === 1 && !this.selectedService) {
      this.error = "Please select a service.";
      return;
    }
    if (this.step === 2) {
      if (!this.street.trim()) {
        this.error = "Please enter your street address.";
        return;
      }
      if (!this.selectedDay) {
        this.error = "Please select a date.";
        return;
      }
      if (!this.selectedTime) {
        this.error = "Please select a time slot.";
        return;
      }
      // Geocode address in background so coordinates are ready by booking time
      this.geoSvc
        .geocode(this.street, this.city, this.postcode)
        .subscribe((coords) => {
          if (coords) {
            this.bookingLat = coords.lat;
            this.bookingLng = coords.lng;
          }
        });
    }
    if (this.step === 4) {
      // Load saved card when entering confirm step
      this.fetchSavedCard();
    }

    this.step++;
  }
  prevStep(): void {
    if (this.step > 1) {
      this.step--;
      this.error = "";
    }
  }

  // ── Load saved card ────────────────────────────────────────
  fetchSavedCard(): void {
    if (!this.auth.isLoggedIn) return;
    this.loadingCard = true;
    this.paymentSvc.getSavedCard().subscribe({
      next: (card) => {
        this.savedCard = card;
        this.loadingCard = false;
      },
      error: () => {
        this.savedCard = { hasCard: false };
        this.loadingCard = false;
      },
    });
  }

  // ── Open payment modal ────────────────────────────────────
  openPaymentModal(): void {
    if (!this.auth.isLoggedIn || this.loading) return;
    this.payError = "";
    this.payProcessing = false;
    this.cardholderName = "";
    this.cardNumDisplay = "•••• •••• •••• ••••";
    this.cardExpDisplay = "MM / YY";

    const ref = this.modalSvc.open(this.paymentTpl, {
      centered: true,
      backdrop: "static",
      size: "md",
    });

    // Mount Stripe Elements only when no saved card (new card form is shown)
    if (!this.savedCard?.hasCard) {
      ref.shown.subscribe(() => this.initStripeForNewCard());
    }
  }

  // ── Initialize Stripe Elements (new card form) ────────────
  private async initStripeForNewCard(): Promise<void> {
    // Get setup intent from backend (also initialises Stripe publishable key)
    this.paymentSvc.createSetupIntent().subscribe({
      next: async (si) => {
        if (!this.stripe) this.stripe = await loadStripe(si.publishableKey);
        if (!this.stripe) return;
        this.mountCardElements(si.clientSecret);
      },
      error: () => {
        this.payError = "Could not initialise card form. Please try again.";
      },
    });
  }

  private mountCardElements(setupSecret: string): void {
    if (!this.stripe) return;
    const elements = this.stripe.elements();
    const style = {
      style: {
        base: {
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontSize: "15px",
          color: "#1a231e",
          "::placeholder": { color: "#aab8b2" },
        },
        invalid: { color: "#e53e3e" },
      },
    };
    this.stripeCardN?.destroy();
    this.stripeCardE?.destroy();
    this.stripeCardC?.destroy();
    this.stripeCardN = elements.create("cardNumber", style);
    this.stripeCardE = elements.create("cardExpiry", style);
    this.stripeCardC = elements.create("cardCvc", style);
    this.stripeCardN.mount("#stripe-num");
    this.stripeCardE.mount("#stripe-exp");
    this.stripeCardC.mount("#stripe-cvc");

    this.stripeCardN.on("change", (e: any) =>
      this.zone.run(() => {
        this.cardNumDisplay = e.complete
          ? "•••• •••• •••• ••••"
          : (e.value?.cardNumber ?? "•••• •••• •••• ••••");
        this.cdr.markForCheck();
      }),
    );
    this.stripeCardE.on("change", (e: any) =>
      this.zone.run(() => {
        this.cardExpDisplay = e.value?.expiry || "MM / YY";
        this.cdr.markForCheck();
      }),
    );

    // Store setup secret for confirmCardSetup later
    (this as any)._setupSecret = setupSecret;
  }

  // ── Pay with new card (save + charge) ────────────────────
  async saveAndPay(modal: NgbActiveModal): Promise<void> {
    if (this.payProcessing || !this.stripe || !this.stripeCardN) return;
    this.payProcessing = true;
    this.payError = "";

    const setupSecret: string = (this as any)._setupSecret ?? "";
    if (!setupSecret) {
      this.payError = "Session expired. Please refresh.";
      this.payProcessing = false;
      return;
    }

    // Step 1: Confirm card setup (saves card on Stripe side)
    const setupResult = await this.stripe.confirmCardSetup(setupSecret, {
      payment_method: {
        card: this.stripeCardN,
        billing_details: { name: this.cardholderName || "Customer" },
      },
    });

    if (setupResult.error) {
      this.payError = setupResult.error.message ?? "Card verification failed.";
      this.payProcessing = false;
      return;
    }

    const paymentMethodId = setupResult.setupIntent.payment_method as string;

    // Step 2: Save card to our DB
    this.paymentSvc.saveCard(paymentMethodId).subscribe({
      next: (card) => {
        this.savedCard = card;
        // Step 3: Create payment intent & charge
        this.chargeCard(paymentMethodId, modal);
      },
      error: () => {
        // Card saved on Stripe but not in our DB — still proceed with payment
        this.chargeCard(paymentMethodId, modal);
      },
    });
  }

  // ── Pay with saved card ────────────────────────────────────
  async payWithSavedCard(modal: NgbActiveModal): Promise<void> {
    if (this.payProcessing || !this.savedCard?.paymentMethodId) return;
    this.payProcessing = true;
    this.payError = "";
    this.chargeCard(this.savedCard.paymentMethodId, modal);
  }

  // ── Create intent + confirm payment ──────────────────────
  private chargeCard(paymentMethodId: string, modal: NgbActiveModal): void {
    this.paymentSvc.createIntent(this.total).subscribe({
      next: async (pi) => {
        if (!this.stripe) this.stripe = await loadStripe(pi.publishableKey);
        if (!this.stripe) {
          this.payError = "Stripe failed to load.";
          this.payProcessing = false;
          return;
        }

        const result = await this.stripe.confirmCardPayment(pi.clientSecret, {
          payment_method: paymentMethodId,
        });

        if (result.error) {
          this.payError =
            result.error.message ?? "Payment failed. Please try again.";
          this.payProcessing = false;
          return;
        }

        // Payment succeeded — now create the booking
        this.createBookingAfterPayment(result.paymentIntent?.id ?? "", modal);
      },
      error: (e: any) => {
        this.payError =
          e?.error?.message || "Could not initialise payment. Try again.";
        this.payProcessing = false;
      },
    });
  }

  // ── Create booking AFTER successful payment ───────────────
  private createBookingAfterPayment(
    paymentIntentId: string,
    modal: NgbActiveModal,
  ): void {
    const dt = new Date(this.calYear, this.calMonth, this.selectedDay!);
    const [h, m] = this.selectedTime.split(":").map(Number);
    dt.setHours(h, m, 0, 0);
    const allNotes = [
      this.notes,
      this.quickTags
        .filter((t) => t.active)
        .map((t) => t.label)
        .join(", "),
    ]
      .filter(Boolean)
      .join(" | ");

    this.bookingSvc
      .createBooking({
        serviceType: this.selectedService!.type as any,
        address: [this.street, this.apt, this.city, this.postcode]
          .filter(Boolean)
          .join(", "),
        scheduledAt: dt.toISOString(),
        durationMinutes: this.durationHours * 60,
        price: this.total,
        notes: allNotes || undefined,
        latitude: this.bookingLat,
        longitude: this.bookingLng,
      })
      .subscribe({
        next: (booking: any) => {
          // Record payment intent in DB (non-blocking)
          this.paymentSvc
            .confirmPayment(booking.id, paymentIntentId)
            .subscribe();
          modal.close();
          // Show booking confirmation modal, then user can navigate
          this.confirmedBooking = booking;
          const confRef = this.modalSvc.open(this.confirmTpl, {
            centered: true,
            backdrop: "static",
            size: "md",
          });
          confRef.shown.subscribe(() => this.launchConfetti());
          confRef.result
            .then((action: string) => {
              if (action === "track")
                this.router.navigate(["/matching", booking.id]);
              else if (action === "issue")
                this.router.navigate(["/booking", booking.id]);
              else this.router.navigate(["/my-bookings"]);
            })
            .catch(() => this.router.navigate(["/my-bookings"]));
        },
        error: (e: any) => {
          this.payError = `Payment successful but booking failed: ${e?.error?.message ?? "Please contact support."}`;
          this.payProcessing = false;
        },
      });
  }

  launchConfetti(): void {
    const colors = ["#25ae59", "#1d8a47", "#a7f3c4", "#ffffff", "#1a231e"];
    const fire = (r: number, o: confetti.Options) =>
      confetti({
        origin: { y: 0.55 },
        colors,
        ...o,
        particleCount: Math.floor(200 * r),
      });
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }
}
