import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  signal, // Importa signal
  input, // Importa input
  output, // Importa output
  effect, // Importa effect
  OnDestroy, // Importa OnDestroy per cleanup
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Router } from '@angular/router';
import { marked } from 'marked';



export interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  imageUrl?: string;
  showDetailButton?: boolean;
  address?: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  // Input Signals
  markers = input.required<MapMarker[]>();
  center = input<L.LatLngExpression>([40.8518, 14.2681]); // Coordinate di Napoli
  zoom = input<number>(13);
  enableClickForCoords = input<boolean>(false);

  // Output Signal
  mapClickCoords = output<{ lat: number, lng: number }>();

  leafletMap!: L.Map;
  selectedMarkerLayer: L.Marker | null = null;
  private currentMarkers: L.Marker[] = [];

  constructor(private readonly router: Router) {
    // Usiamo effect() per reagire ai cambiamenti degli input signals
    effect(() => {
      // Accedi ai segnali per triggerare l'effect quando cambiano
      const markers = this.markers();
      const center = this.center();
      const zoom = this.zoom();
      // Questo effect si attiva quando markers(), center() o zoom() cambiano
      // Esegue la logica che prima era in ngOnChanges per l'aggiornamento della mappa
      if (this.leafletMap) {
        this.updateMarkers();
        this.leafletMap.setView(this.center(), this.zoom());
      }
    });

    effect(() => {
      const markers = this.markers();
      const center = this.center();
      const zoom = this.zoom();
      // Questo effect si attiva quando enableClickForCoords() cambia
      if (this.leafletMap) {
        if (this.enableClickForCoords()) {
          this.leafletMap.on('click', this.handleMapClick, this);
        } else {
          this.leafletMap.off('click', this.handleMapClick, this);
          if (this.selectedMarkerLayer) {
            this.leafletMap.removeLayer(this.selectedMarkerLayer);
            this.selectedMarkerLayer = null;
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (!this.mapContainer || this.leafletMap) {
      return;
    }

    this.leafletMap = L.map(this.mapContainer.nativeElement, {
      center: this.center(),
      zoom: this.zoom()
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.leafletMap);

    this.updateMarkers();
    if (this.enableClickForCoords()) { // Accedi al valore del signal con ()
      this.leafletMap.on('click', this.handleMapClick, this);
    }
  }

  private handleMapClick(e: L.LeafletMouseEvent): void {
    const { lat, lng } = e.latlng;
    this.mapClickCoords.emit({ lat, lng }); // Emetti tramite .emit()

    if (this.selectedMarkerLayer) {
      this.leafletMap.removeLayer(this.selectedMarkerLayer);
    }
    const customIcon = L.icon({
      iconUrl: 'assets/MarkerCats.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [72, 72],
      iconAnchor: [36, 72],
      popupAnchor: [0, -72],
      shadowSize: [72, 40],
      shadowAnchor: [25, 40]
    });

    const newMarker = L.marker([lat, lng], { icon: customIcon }).addTo(this.leafletMap);
    this.selectedMarkerLayer = newMarker;
  }
  private updateMarkers(): void {
    if (!this.leafletMap) {
      return;
    }

    this.currentMarkers.forEach(marker => {
      this.leafletMap.removeLayer(marker);
    });
    this.currentMarkers = [];

    this.markers().forEach(markerData => {
      const customIcon = L.icon({
        iconUrl: markerData.imageUrl || 'assets/MarkerCats.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [72, 72],
        iconAnchor: [36, 72],
        popupAnchor: [0, -72],
        shadowSize: [72, 40],
        shadowAnchor: [25, 40]
      });

      const marker = L.marker([markerData.lat, markerData.lng], { icon: customIcon });
      // Converti markdown in HTML per tooltip e popup
      const descriptionHtml = marked.parse(markerData.description || '') as string;

      // Tooltip diverso per pagina dettaglio vs lista
      if (markerData.showDetailButton === false) {
        // Pagina dettaglio: info posizione
        marker.bindTooltip(
          `<b>📍 Clicca per info posizione</b>`,
          { permanent: false, direction: 'top' }
        );
      } else {
        // Lista: invito a cliccare per dettagli
        marker.bindTooltip(
          `<b>🐱 Clicca per dettagli avvistamento</b>`,
          { permanent: false, direction: 'top' }
        );
      }

      marker.bindPopup(() => {
        const div = L.DomUtil.create('div');
        
        if (markerData.showDetailButton === false) {
          // Popup per pagina dettaglio: coordinate + link navigazione
          const googleMapsUrl = `https://www.google.com/maps?q=${markerData.lat},${markerData.lng}`;
          div.innerHTML = `
            <div class="map-popup-detail">
              <p style="margin: 0 0 8px 0;"><strong>📍 Coordinate:</strong><br>
                Lat: ${markerData.lat.toFixed(5)}<br>
                Lng: ${markerData.lng.toFixed(5)}
              </p>
              ${markerData.address ? `<p style="margin: 0 0 8px 0;"><strong>🏠 Indirizzo:</strong><br>${markerData.address}</p>` : ''}
              <a href="${googleMapsUrl}" target="_blank" rel="noopener" 
                 style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: linear-gradient(135deg, #ff9800, #f57c00); color: white; 
                        text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 500; box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3); transition: transform 0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                Naviga con Google Maps
              </a>
            </div>
          `;
        } else {
          // Popup standard con pulsante dettaglio custom
          div.innerHTML = `
            <div style="text-align: center; padding: 4px;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 15px;">${markerData.title}</h3>
              <p style="margin: 0 0 12px 0; color: #666; font-size: 13px; line-height: 1.4;">${descriptionHtml.substring(0, 150)}${descriptionHtml.length > 150 ? '...' : ''}</p>
              <button id="detail-button-${markerData.id}" 
                      style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #ff9800, #f57c00); color: white; 
                             border: none; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3); transition: transform 0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                Vedi Dettaglio
              </button>
            </div>
          `;
          const detailButton = div.querySelector(`#detail-button-${markerData.id}`) as HTMLElement;
          if (detailButton) {
            L.DomEvent.on(detailButton, 'click', () => {
              this.router.navigate(['/cats', markerData.id]);
            });
          }
        }
        return div;
      });

      marker.addTo(this.leafletMap);
      this.currentMarkers.push(marker);
    });
  }


  ngOnDestroy(): void {
    if (this.leafletMap) {
      this.leafletMap.off('click', this.handleMapClick, this);
      this.leafletMap.remove();
    }
  }
}