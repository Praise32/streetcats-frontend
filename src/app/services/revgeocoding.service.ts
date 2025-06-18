import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  constructor(private http: HttpClient) { }

  reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    return this.http.get<any>(url).pipe(
      map(res => ({
        address: (res.address.road || '') + (res.address.house_number ? ` ${res.address.house_number}` : ''),
        city: res.address.city || res.address.town || res.address.village || '',
        cap: res.address.postcode || ''
      }))
    );
  }
}