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
        marker.bindTooltip(
          `<b>📍 Clicca per info posizione</b>`,
          { permanent: false, direction: 'top' }
        );
      } else {
        marker.bindTooltip(
          `<b>${markerData.title}</b><br>${descriptionHtml.substring(0, 100)}`,
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
                 style="display: inline-block; padding: 6px 12px; background: #ff9800; color: white; 
                        text-decoration: none; border-radius: 4px; font-size: 13px;">
                🗺️ Apri in Google Maps
              </a>
            </div>
          `;
        } else {
          // Popup standard con pulsante dettaglio
          div.innerHTML = `
            <h3>${markerData.title}</h3>
            <div>${descriptionHtml.substring(0, 256)}</div>
            <button id="detail-button-${markerData.id}">Vedi Dettaglio</button>
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