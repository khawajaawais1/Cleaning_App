import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API_BASE = 'http://localhost:5000/api';
const INTERVAL_MS = 15_000; // send every 15 seconds while job is active

@Injectable({ providedIn: 'root' })
export class LocationService implements OnDestroy {
  private watchId: number | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastPosition: GeolocationPosition | null = null;
  private activeBookingId: number | null = null;
  isTracking = false;

  constructor(private http: HttpClient) {}

  startTracking(bookingId: number): void {
    if (this.isTracking) return;
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    this.activeBookingId = bookingId;
    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      pos => { this.lastPosition = pos; },
      err => console.warn('Geolocation error:', err.message),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 }
    );

    // Send immediately, then on interval
    this.sendLocation();
    this.intervalId = setInterval(() => this.sendLocation(), INTERVAL_MS);
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTracking = false;
    this.activeBookingId = null;
    this.lastPosition = null;
  }

  private sendLocation(): void {
    if (!this.lastPosition) return;
    const { latitude, longitude } = this.lastPosition.coords;
    this.http.post(`${API_BASE}/worker/location`, {
      latitude,
      longitude,
      activeBookingId: this.activeBookingId,
    }).subscribe({
      error: err => console.warn('Failed to send location update:', err.message),
    });
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }
}
