import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../core/services/auth.service";
import { WorkerProfile } from "../../core/models/worker.model";

/* const API_BASE = 'http://localhost:5000/api'; */
const API_BASE =
  "https://h2c-backend-hke4dgfyfrbpavee.polandcentral-01.azurewebsites.net/api";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  profile: WorkerProfile | null = null;
  editMode = false;
  saving = false;
  togglingOnline = false;

  form = this.fb.group({
    phone: ["", Validators.required],
    city: [""],
    serviceType: [""],
    bio: [""],
  });

  cities = [
    "London",
    "Manchester",
    "Birmingham",
    "Leeds",
    "Sheffield",
    "Bristol",
    "Liverpool",
  ];
  serviceTypes = [
    "Standard Clean",
    "Deep Clean",
    "End of Tenancy",
    "Office Clean",
    "Carpet Clean",
  ];

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe((p) => {
      this.profile = p;
      if (p) {
        this.form.patchValue({
          phone: p.phone,
          city: p.city,
          serviceType: p.serviceType,
          bio: p.bio ?? "",
        });
      }
    });
  }

  getInitials(): string {
    const fullName =
      `${this.profile?.firstName ?? ""} ${this.profile?.lastName ?? ""}`.trim();

    if (!fullName) return "W";

    const parts = fullName.split(/\s+/);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get statusClass(): string {
    const map: Record<string, string> = {
      active: "pill-green",
      pending: "pill-amber",
      suspended: "pill-red",
      rejected: "pill-red",
    };
    return map[this.profile?.status ?? "pending"] ?? "pill-gray";
  }

  get statusLabel(): string {
    const map: Record<string, string> = {
      active: "Active",
      pending: "Pending approval",
      suspended: "Suspended",
      rejected: "Rejected",
    };
    return map[this.profile?.status ?? "pending"] ?? "Unknown";
  }

  toggleOnline(): void {
    if (!this.profile || this.togglingOnline) return;
    this.togglingOnline = true;

    const newValue = !this.profile.isOnline;
    this.auth.setOnline(newValue).subscribe({
      next: () => {
        this.togglingOnline = false;
      },
      error: () => {
        // Optimistic rollback on failure
        this.togglingOnline = false;
      },
    });
  }

  saveProfile(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    this.http
      .put(`${API_BASE}/worker/me`, {
        phone: v.phone,
        city: v.city,
        serviceType: v.serviceType,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.editMode = false;
        },
        error: () => {
          this.saving = false;
          this.editMode = false;
        },
      });
  }

  logout(): void {
    this.auth.logout();
  }
}
