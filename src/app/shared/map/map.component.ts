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

export interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  imageUrl?: string;
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
  markers = input<MapMarker[]>([]);
  center = input<L.LatLngExpression>([40.8518, 14.2681]); // Coordinate di Napoli
  zoom = input<number>(13);
  enableClickForCoords = input<boolean>(false);

  // Output Signal
  mapClickCoords = output<{ lat: number, lng: number }>();

  leafletMap!: L.Map;
  selectedMarkerLayer: L.Marker | null = null;
  private currentMarkers: L.Marker[] = [];

  constructor(private router: Router) {
    // Usiamo effect() per reagire ai cambiamenti degli input signals
    effect(() => {
      // Questo effect si attiva quando markers(), center() o zoom() cambiano
      // Esegue la logica che prima era in ngOnChanges per l'aggiornamento della mappa
      if (this.leafletMap) {
        this.updateMarkers();
        this.leafletMap.setView(this.center(), this.zoom());
      }
    });

    effect(() => {
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
      center: this.center(), // Accedi al valore del signal con ()
      zoom: this.zoom()      // Accedi al valore del signal con ()
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

    const newMarker = L.marker([lat, lng]).addTo(this.leafletMap);
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
        iconUrl: markerData.imageUrl || 'assets/cat-marker.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([markerData.lat, markerData.lng], { icon: customIcon });

      marker.bindTooltip(`<b>${markerData.title}</b><br>${markerData.description || ''}`, {
        permanent: false,
        direction: 'top'
      });

      marker.bindPopup(() => {
        const div = L.DomUtil.create('div');
        div.innerHTML = `
          <h3>${markerData.title}</h3>
          <p>${markerData.description || ''}</p>
          <button id="detail-button-${markerData.id}">Vedi Dettaglio</button>
        `;

        const detailButton = div.querySelector(`#detail-button-${markerData.id}`) as HTMLElement;


        if (detailButton) { // Il controllo di nullità è ancora importante!
          L.DomEvent.on(detailButton, 'click', () => {
            this.router.navigate(['/cats', markerData.id]);
          });
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