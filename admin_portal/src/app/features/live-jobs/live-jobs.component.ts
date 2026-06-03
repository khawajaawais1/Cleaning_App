import {
  Component, OnInit, OnDestroy, AfterViewInit, NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/models/booking.model';
import { ExtensionRequestService } from '../../core/services/extension-request.service';
import { ExtensionRequest } from '../../core/models/extension-request.model';
import { Subject, interval, forkJoin } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as L from 'leaflet';

/* ─── Fallback scatter offsets when no coords stored yet ─────── */
const FALLBACK_OFFSETS: [number, number][] = [
  [ 0.012,  0.021], [-0.008,  0.031], [ 0.019, -0.014],
  [-0.015, -0.028], [ 0.005,  0.041], [-0.023,  0.012],
];

const AVATAR_COLORS: Record<string, string> = {
  MK: '#3d7a5c', JR: '#c9742b', PN: '#3d6080',
  SO: '#5a7a4a', AL: '#7a7a7a', EV: '#6b4a7a',
};

/* Service-type enum name → readable label */
const SERVICE_LABELS: Record<string, string> = {
  DeepClean:        'Deep Clean',
  StandardClean:    'Standard Clean',
  MoveInOut:        'Move In/Out',
  PostConstruction: 'Post Construction',
  OfficeClean:      'Office Clean',
};

@Component({
  selector: 'app-live-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './live-jobs.component.html',
  styleUrls: ['./live-jobs.component.scss'],
})
export class LiveJobsComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private destroy$ = new Subject<void>();
  private readonly CENTER: [number, number] = [60.1699, 24.9384]; // Helsinki

  /** Only active / upcoming jobs — what the live board cares about */
  bookings: Booking[] = [];
  pendingExtension: ExtensionRequest | null = null;
  loading = true;

  get activeCount(): number {
    return this.bookings.filter(b => b.status === 'in_progress').length;
  }
  get onlineCount(): number {
    return this.bookings.filter(b => b.worker != null).length;
  }

  constructor(
    private bookingSvc: BookingService,
    private extensionSvc: ExtensionRequestService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.load();
    interval(60_000).pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
  }

  /** Map is always in DOM (no *ngIf), so init here is safe */
  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => setTimeout(() => this.initMap(), 100));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) this.map.remove();
  }

  /* ── Data ─────────────────────────────────────────────────── */
  load(): void {
    forkJoin({
      all:  this.bookingSvc.getBookings(1, 100).pipe(catchError(() => of({ data: [], total: 0 } as any))),
      exts: this.extensionSvc.getExtensionRequests('pending').pipe(catchError(() => of([]))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ all, exts }) => {
      /* API returns either { data: [], total: N } or flat [] depending on endpoint */
      const raw: Booking[] = Array.isArray(all) ? all : (all as any)?.data ?? [];

      /* Live board: only in_progress + scheduled (not cancelled / completed) */
      this.bookings = raw.filter(
        b => b.status === 'in_progress' || b.status === 'scheduled'
      );

      this.pendingExtension = (exts as ExtensionRequest[])[0] ?? null;
      this.loading = false;

      this.zone.runOutsideAngular(() => setTimeout(() => this.refreshMarkers(), 50));
    });
  }

  /* ── Map ──────────────────────────────────────────────────── */
  private initMap(): void {
    const el = document.getElementById('live-map');
    if (!el || this.map) return;

    this.map = L.map('live-map', {
      center: this.CENTER, zoom: 13,
      zoomControl: false, attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.refreshMarkers();
  }

  private refreshMarkers(): void {
    if (!this.map) return;
    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.bookings.forEach((b, idx) => {
      // ── Use real geocoded coordinates when stored; fall back to Helsinki scatter ──
      const lat = (b.latitude  && b.longitude) ? b.latitude  : this.CENTER[0] + (FALLBACK_OFFSETS[idx % FALLBACK_OFFSETS.length][0]);
      const lng = (b.latitude  && b.longitude) ? b.longitude : this.CENTER[1] + (FALLBACK_OFFSETS[idx % FALLBACK_OFFSETS.length][1]);

      const key    = this.workerKey(b);
      const color  = AVATAR_COLORS[key] ?? '#10384a';
      const ring   = b.status === 'in_progress' ? '#22c55e' : '#f59e0b';
      const isLive = b.status === 'in_progress';
      const size   = isLive ? 46 : 38;
      const label  = b.worker ? b.worker.firstName : b.customer?.firstName ?? 'Job';
      const hasCoords = !!(b.latitude && b.longitude);

      const html = `
        <div class="map-pin ${isLive ? 'map-pin--active' : ''} ${!hasCoords ? 'map-pin--approx' : ''}"
             style="width:${size}px;height:${size}px;background:${color};
                    box-shadow:0 0 0 3px ${ring},0 4px 12px rgba(0,0,0,.22);">
          <span>${this.pinInitials(b)}</span>
          <div class="map-pin-label">${label}${!hasCoords ? ' ~' : ''}</div>
        </div>`;

      const icon   = L.divIcon({ html, className: '', iconSize: [size, size + 22], iconAnchor: [size / 2, size / 2] });
      const worker = b.worker ? `${b.worker.firstName} ${b.worker.lastName}` : 'Unassigned';
      const coordNote = hasCoords ? `📍 Exact location` : `📍 Approximate (address not geocoded yet)`;
      const popup  = `<b>${worker}</b><br>${this.formatServiceType(b.serviceType)}<br>${b.address}<br><small style="color:#738279">${coordNote}</small>`;

      this.markers.push(L.marker([lat, lng], { icon }).addTo(this.map).bindPopup(popup));
    });

    // Auto-fit map to show all markers if any exist
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 14 });
    } else {
      this.map.setView(this.CENTER, 13);
    }
  }

  /* ── Helpers ─────────────────────────────────────────────── */

  /** Two-letter key used to look up colours/offsets — based on worker if present, else customer */
  private workerKey(b: Booking): string {
    if (b.worker) {
      return ((b.worker.firstName?.[0] ?? 'M') + (b.worker.lastName?.[0] ?? 'K')).toUpperCase();
    }
    return ((b.customer?.firstName?.[0] ?? 'C') + (b.customer?.lastName?.[0] ?? 'U')).toUpperCase();
  }

  pinInitials(b: Booking): string {
    return this.workerKey(b);
  }

  colorKey(b: Booking): string {
    const key = this.workerKey(b);
    const map: Record<string, string> = {
      MK: 'mk', JR: 'jr', PN: 'pn', SO: 'so', AL: 'al', EV: 'ev',
    };
    return map[key] ?? 'mk';
  }

  displayName(b: Booking): string {
    if (b.worker) {
      return `${b.worker.firstName} ${b.worker.lastName[0] ?? ''}.`;
    }
    return b.customer ? `${b.customer.firstName} ${b.customer.lastName[0]}.` : 'Unassigned';
  }

 

  



  formatServiceType(raw: string): string {
    return SERVICE_LABELS[raw] ?? raw.replace(/([A-Z])/g, ' $1').trim();
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = {
      in_progress: 'In progress', scheduled: 'Scheduled',
      completed: 'Complete', cancelled: 'Cancelled', pending: 'Pending',
    };
    return m[status] ?? status;
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    return h > 0 ? `Est. ${h}h` : `Est. ${minutes}m`;
  }

  allowExtension(): void {
    if (!this.pendingExtension) return;
    this.extensionSvc.approveRequest(this.pendingExtension.id)
      .pipe(takeUntil(this.destroy$)).subscribe({ next: () => this.load() });
  }

  denyExtension(): void {
    if (!this.pendingExtension) return;
    this.extensionSvc.denyRequest(this.pendingExtension.id, 'Denied via live board')
      .pipe(takeUntil(this.destroy$)).subscribe({ next: () => this.load() });
  }
}
