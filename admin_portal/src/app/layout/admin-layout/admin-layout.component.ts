import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  badge: number;
  badgeTone?: 'green' | 'orange';
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  currentUser: User | null = null;
  pageTitle = 'Dashboard';

  navItems: NavItem[] = [
    { icon: 'grid', label: 'Dashboard', path: '/dashboard', badge: 0 },
    { icon: 'pin', label: 'Live job board', path: '/live-jobs', badge: 3, badgeTone: 'green' },
    { icon: 'clock', label: 'Extensions', path: '/extension-requests', badge: 0 },
    { icon: 'card', label: 'Applications', path: '/worker-applications', badge: 3, badgeTone: 'green' },
    { icon: 'team', label: 'Workers', path: '/workers', badge: 0 },
    { icon: 'calendar', label: 'Bookings', path: '/bookings', badge: 2, badgeTone: 'orange' },
    { icon: 'tag',      label: 'Pricing',         path: '/pricing',         badge: 0 },
    { icon: 'settings', label: 'Control Centre', path: '/control-centre', badge: 0 },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.updatePageTitle();
  }

  updatePageTitle(): void {
    const currentPath = this.router.url;
    const navItem = this.navItems.find(item => item.path === currentPath);
    this.pageTitle = navItem?.label ?? 'Dashboard';
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    if (!this.currentUser) return 'A';
    return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
  }
}
