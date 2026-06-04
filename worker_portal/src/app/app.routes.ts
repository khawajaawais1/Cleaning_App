import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { PortalInactiveComponent } from './features/auth/portal-inactive/portal-inactive.component';
import { WorkerLayoutComponent } from './layout/worker-layout/worker-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { JobsComponent } from './features/jobs/jobs.component';
import { EarningsComponent } from './features/earnings/earnings.component';
import { ProfileComponent } from './features/profile/profile.component';
import { DocumentsComponent } from './features/documents/documents.component';

export const routes: Routes = [
  { path: 'login',           component: LoginComponent,        canActivate: [publicGuard] },
  { path: 'signup',          component: SignupComponent,        canActivate: [publicGuard] },
  { path: 'portal-inactive', component: PortalInactiveComponent },
  {
    path: '',
    component: WorkerLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',  component: DashboardComponent },
      { path: 'schedule',   component: ScheduleComponent },
      { path: 'jobs',       component: JobsComponent },
      { path: 'earnings',   component: EarningsComponent },
      { path: 'profile',    component: ProfileComponent },
      { path: 'documents',  component: DocumentsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
