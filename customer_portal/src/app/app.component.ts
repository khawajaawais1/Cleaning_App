import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

const WIZARD_ROUTES = ['/login', '/register', '/book'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  template: `
    <ng-container *ngIf="showShell">
      <app-navbar></app-navbar>
    </ng-container>
    <main [class.main-content]="showShell">
      <router-outlet></router-outlet>
    </main>
    <ng-container *ngIf="showShell">
      <app-footer></app-footer>
    </ng-container>
  `,
  styles: [`.main-content { min-height: calc(100vh - 68px - 88px); }`],
})
export class AppComponent implements OnInit {
  showShell = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.showShell = !WIZARD_ROUTES.some(r => e.urlAfterRedirects.startsWith(r));
      });
  }
}
