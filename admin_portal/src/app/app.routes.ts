import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { WorkerApplicationsComponent } from './features/worker-applications/worker-applications.component';
import { WorkersComponent } from './features/workers/workers.component';
import { LiveJobsComponent } from './features/live-jobs/live-jobs.component';
import { BookingsComponent } from './features/bookings/bookings.component';
import { ExtensionRequestsComponent } from './features/extension-requests/extension-requests.component';
import { BookingDetailComponent } from './features/bookings/booking-detail/booking-detail.component';
import { ControlCentreComponent } from './features/control-centre/control-centre.component';
import { PricingComponent } from './features/pricing/pricing.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',           component: DashboardComponent },
      { path: 'workers',             component: WorkersComponent },
      { path: 'worker-applications', component: WorkerApplicationsComponent },
      { path: 'live-jobs',           component: LiveJobsComponent },
      { path: 'bookings',            component: BookingsComponent },
      { path: 'bookings/:id',        component: BookingDetailComponent },
      { path: 'extension-requests',  component: ExtensionRequestsComponent },
      { path: 'control-centre',      component: ControlCentreComponent },
      { path: 'pricing',             component: PricingComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
