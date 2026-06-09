import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { User } from "../../core/models/user.model";
import { ExtensionRequestService } from "@app/core/services/extension-request.service";
import { WorkerService } from "@app/core/services/worker.service";
import { LiveJobService } from "@app/core/services/live-job.service";
import { BookingService } from "@app/core/services/booking.service";

interface NavItem {
  icon: string;
  label: string;
  path: string;
  badge: number;
  badgeTone?: "green" | "orange";
}

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements OnInit {
  currentUser: User | null = null;
  pageTitle = "Dashboard";

  navItems: NavItem[] = [
    { icon: "dashboardIcon", label: "Dashboard", path: "/dashboard", badge: 0 },
    {
      icon: "liveJobBoardIcon",
      label: "Live job board",
      path: "/live-jobs",
      badge: 0,
      badgeTone: "green",
    },
    {
      icon: "extensionIcon",
      label: "Extensions",
      path: "/extension-requests",
      badge: 0,
    },
    {
      icon: "applicationsIcon",
      label: "Applications",
      path: "/worker-applications",
      badge: 0,
      badgeTone: "green",
    },
    { icon: "workersIcon", label: "Workers", path: "/workers", badge: 0 },
    {
      icon: "bookingsIcon",
      label: "Bookings",
      path: "/bookings",
      badge: 0,
      badgeTone: "orange",
    },
    { icon: "pricingIcon", label: "Pricing", path: "/pricing", badge: 0 },
    /* {
      icon: "settingsIcon",
      label: "Control Centre",
      path: "/control-centre",
      badge: 0,
    }, */
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private extensionService: ExtensionRequestService,
    private workerService: WorkerService,
    private jobsService: LiveJobService,
    private bookingService: BookingService,
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });
    this.updatePageTitle();
    this.loadBadges();
  }

  updatePageTitle(): void {
    const currentPath = this.router.url;
    const navItem = this.navItems.find((item) => item.path === currentPath);
    this.pageTitle = navItem?.label ?? "Dashboard";
  }

  loadBadges(): void {
    // Example: Extensions pending count
    this.extensionService.getExtensionRequests().subscribe((res) => {
      const pendingExtensions = res.filter(
        (r) => r.status !== "pending",
      ).length;
      this.updateBadge("/extension-requests", pendingExtensions);
    });

    // Example: (you would replace these with real APIs)

    // Worker applications
    this.workerService.getApplications().subscribe((res) => {
      this.updateBadge(
        "/worker-applications",
        res.filter((a) => a.status === "pending").length,
      );
    });

    // Live jobs
     this.jobsService.getLiveJobs().subscribe(res => {
       this.updateBadge("/live-jobs", res.length);
     });

    // Bookings
     this.bookingService.getBookings().subscribe(res => {
       this.updateBadge("/bookings", res.data.filter(b => b.status === "pending").length);
     });
  }

  private updateBadge(path: string, count: number): void {
    this.navItems = this.navItems.map((item) =>
      item.path === path ? { ...item, badge: count } : item,
    );
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    if (!this.currentUser) return "A";
    return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
  }
}
