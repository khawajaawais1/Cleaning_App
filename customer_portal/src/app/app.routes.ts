import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'book',
    loadComponent: () => import('./features/book/book.component').then(m => m.BookComponent),
  },
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
  },
  {
    path: 'booking/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
  },
  {
    path: 'matching/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/matching/matching.component').then(m => m.MatchingComponent),
  },
  {
    path: 'completion/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/completion/completion.component').then(m => m.CompletionComponent),
  },
  {
    path: 'review/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/review/review.component').then(m => m.ReviewComponent),
  },
  { path: '**', redirectTo: 'home' },
];
