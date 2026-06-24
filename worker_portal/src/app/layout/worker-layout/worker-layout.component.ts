import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService } from "../../core/services/auth.service";
import { WorkerProfile } from "../../core/models/worker.model";

interface NavTab {
  path: string;
  label: string;
  icon: string;
  activeIcon: string;
}

@Component({
  selector: "app-worker-layout",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./worker-layout.component.html",
  styleUrls: ["./worker-layout.component.scss"],
})
export class WorkerLayoutComponent implements OnInit {
  profile: WorkerProfile | null = null;
  currentPath = "/dashboard";

  tabs: NavTab[] = [
    {
      path: "/dashboard",
      label: "Home",
      icon: "home",
      activeIcon: "home-filled",
    },
    {
      path: "/schedule",
      label: "Schedule",
      icon: "calendar",
      activeIcon: "calendar-filled",
    },
    { path: "/jobs", label: "Jobs", icon: "job", activeIcon: "job-filled" },
    {
      path: "/earnings",
      label: "Earnings",
      icon: "payments",
      activeIcon: "payments-filled",
    },
    {
      path: "/profile",
      label: "Profile",
      icon: "person",
      activeIcon: "person-filled",
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe((p) => (this.profile = p));
    this.currentPath = "/" + this.router.url.split("/")[1];
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentPath =
          "/" + (e as NavigationEnd).urlAfterRedirects.split("/")[1];
      });
  }

  isActive(path: string): boolean {
    return this.currentPath === path;
  }

  getInitials(): string {
    if (!this.profile) return "W";

    const first = this.profile.firstName?.[0] ?? "";
    const last = this.profile.lastName?.[0] ?? "";

    return (first + last).toUpperCase() || "W";
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }
}
