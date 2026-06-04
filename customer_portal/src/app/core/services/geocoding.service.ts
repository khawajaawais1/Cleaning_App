import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface GeoCoords { lat: number; lng: number; }

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly NOMINATIM = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  geocode(street: string, city: string, postcode: string): Observable<GeoCoords | null> {
    const q = [street, postcode, city, 'Finland'].filter(Boolean).join(', ');
    return this.http.get<any[]>(this.NOMINATIM, {
      params: { q, format: 'json', limit: '1', addressdetails: '0' },
      headers: {
        'Accept-Language': 'en',
        // Nominatim policy: must identify the application
        'User-Agent': 'Happy2Clean-CustomerApp/1.0 (booking geocoding)',
      },
    }).pipe(
      map(results =>
        results.length
          ? { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
          : null
      ),
      catchError(() => of(null)),
    );
  }
}
