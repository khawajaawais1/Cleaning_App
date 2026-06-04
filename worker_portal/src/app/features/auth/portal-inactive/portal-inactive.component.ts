import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-portal-inactive',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portal-inactive.component.html',
  styleUrls: ['./portal-inactive.component.scss'],
})
export class PortalInactiveComponent {}
