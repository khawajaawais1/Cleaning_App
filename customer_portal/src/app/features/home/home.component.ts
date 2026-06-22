import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PricingService } from "../../core/services/pricing.service";
import { ServiceOption } from "../../core/models/booking.model";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  private LocalIcons: Record<string, string> = {
    StandardClean: "service-1.svg",
    DeepClean: "service-2.svg",
    OfficeClean: "service-3.svg",
    MoveInOut: "service-4.svg",
  };
  private LocalImages: Record<string, string> = {
    StandardClean: "clean-1.png",
    DeepClean: "clean-2.png",
    OfficeClean: "clean-3.png",
    MoveInOut: "clean-4.png",
  };

  services: ServiceOption[] = [];

  steps = [
    {
      num: "01",
      icon: "step-1.svg",
      title: "Tell us what you need",
      desc: "Pick a service — Standard, Deep, Office or Move-out — and add any extras like oven, fridge or windows.",
    },
    {
      num: "02",
      icon: "step-2.svg",
      title: "Choose your slot",
      desc: "Pick a date and time that fits your week. We'll match you with a top-rated cleaner near you.",
    },
    {
      num: "03",
      icon: "step-3.svg",
      title: "Relax & track live",
      desc: "Watch your cleaner on the way, see their ETA, and get a clean home — paid only when it's done.",
    },
  ];

  features = [
    {
      icon: "hand-picked-cleaners.svg",
      title: "Hand-picked cleaners",
      desc: "Every cleaner passes a background check, in-person interview and a 3-job trial period before they take their first booking.",
    },
    {
      icon: "transparent-price.svg",
      title: "Transparent pricing",
      desc: "See your total upfront in euros. No hidden surcharges, no last-minute fees — your card is only charged when the job is done.",
    },
    {
      icon: "live-tracking.svg",
      title: "Live tracking",
      desc: 'Know exactly when your cleaner will arrive with real-time location sharing — no more "between 9 and 1" time windows.',
    },
    {
      icon: "talk-to-a-human.svg",
      title: "Talk to a human",
      desc: "Our support team is real, local and replies in under 5 minutes — every booking is backed by people, not bots.",
    },
  ];

  testimonials = [
    {
      stars: 5,
      text: '"Maria was incredible — eco-friendly products, friendly with our dog, and the apartment looked brand new. Booked her again on the spot."',
      name: "Sarah Chen",
      meta: "Helsinki · Deep clean",
    },
    {
      stars: 5,
      text: '"Booked in 4 minutes on a Sunday night. Cleaner showed up the next morning right on time. Live tracking saved my anxious morning."',
      name: "Marcus Olsen",
      meta: "Espoo · Standard clean",
    },
    {
      stars: 5,
      text: '"Got our full deposit back. The cleaner left a checklist of every room — landlord couldn\'t find a single thing to complain about."',
      name: "Priya & Aiden",
      meta: "Vantaa · Move-out clean",
    },
  ];

  faqs = [
    {
      q: "How quickly can I book a cleaner?",
      a: "Often same-day. Book in under 5 minutes and we'll match you with an available cleaner in your area.",
    },
    {
      q: "Do I need to provide cleaning supplies?",
      a: "No — your cleaner brings everything. We use eco-friendly, professional-grade products.",
    },
    {
      q: "What if I'm not happy with the clean?",
      a: "We offer a free re-clean within 48 hours, no questions asked. Your satisfaction is guaranteed.",
    },
    {
      q: "How does payment work?",
      a: "Your card is only charged when the job is marked complete. No subscriptions, no commitments.",
    },
    {
      q: "Are your cleaners insured?",
      a: "Yes — all cleaners carry public liability insurance and are ID-verified before joining.",
    },
  ];

  openFaq: number | null = null;

  constructor(private pricingService: PricingService) {}

  ngOnInit(): void {
    this.pricingService.rates$.subscribe((rates) => {
      this.services = rates.map((service) => ({
        ...service,
        icon: this.LocalIcons[service.type] || "default.svg",
        image: this.LocalImages[service.type] || "default.png",
      }));
    });
  }

  toggle(i: number): void {
    this.openFaq = this.openFaq === i ? null : i;
  }
}
