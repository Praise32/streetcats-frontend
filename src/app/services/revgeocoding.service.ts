import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface NominatimResponse {
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
  };
}

interface GeocodingResult {
  address: string;
  city: string;
  cap: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org';

  constructor(private readonly http: HttpClient) { }

  reverseGeocode(lat: number, lon: number): Observable<GeocodingResult> {
    const url = `${this.nominatimUrl}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    return this.http.get<NominatimResponse>(url).pipe(
      map(res => ({
        address: (res.address.road || '') + (res.address.house_number ? ` ${res.address.house_number}` : ''),
        city: res.address.city || res.address.town || res.address.village || '',
        cap: res.address.postcode || ''
      }))
    );
  }

  searchAddress(query: string): Observable<NominatimResponse[]> {
    const url = `${this.nominatimUrl}/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=5`;
    return this.http.get<NominatimResponse[]>(url);
  }
}
