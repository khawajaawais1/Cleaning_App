import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent {
  step: "form" | "success" = "form";

  form = this.fb.group({
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    phone: ["", Validators.required],
    city: ["", Validators.required],
    serviceType: ["", Validators.required],
    password: ["", [Validators.required, Validators.minLength(8)]],
  });

  loading = false;
  error = "";
  showPassword = false;

  serviceTypes = [
    "Standard Clean",
    "Deep Clean",
    "End of Tenancy",
    "Office Clean",
    "Carpet Clean",
  ];
  /* cities = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Sheffield', 'Bristol', 'Liverpool']; */
  cities = [
    "Helsinki",
    "Espoo",
    "Tampere",
    "Vantaa",
    "Oulu",
    "Turku",
    "Jyväskylä",
    "Lahti",
    "Kuopio",
    "Kouvola",
    "Pori",
    "Joensuu",
    "Lappeenranta",
    "Hämeenlinna",
    "Vaasa",
    "Seinäjoki",
    "Rovaniemi",
    "Mikkeli",
    "Kotka",
    "Salo",
    "Porvoo",
    "Kokkola",
    "Lohja",
    "Hyvinkää",
    "Nurmijärvi",
    "Järvenpää",
    "Rauma",
    "Kirkkonummi",
    "Tuusula",
    "Kajaani",
    "Savonlinna",
    "Kerava",
    "Nokia",
    "Ylöjärvi",
    "Kangasala",
    "Riihimäki",
    "Imatra",
    "Raahe",
    "Sastamala",
    "Varkaus",
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = "";
    const v = this.form.value;
    this.auth
      .signup({
        firstName: v.firstName!,
        lastName: v.lastName!,
        email: v.email!,
        phone: v.phone!,
        city: v.city!,
        serviceType: v.serviceType!,
        password: v.password!,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.step = "success";
        },
        error: () => {
          this.loading = false;
          this.error = "Something went wrong. Please try again.";
        },
      });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
