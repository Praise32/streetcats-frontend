// src/app/cats/list/cat-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, MapMarker } from '../../../shared/map/map.component'; // Importa il MapComponent
import { CatService } from '../../../services/cat.service';
import { CatPost } from '../../../interfaces/modules';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-cat-list',
  standalone: true,
  imports: [CommonModule, MapComponent, RouterModule, MarkdownModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class CatListComponent implements OnInit {
  // Questi sono segnali interni al componente
  catMarkers = signal<MapMarker[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  cats = signal<CatPost[]>([]);

  constructor(private catService: CatService) { }

  ngOnInit(): void {
    this.loadCats();
  }

  private loadCats(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.catService.getAllCats().subscribe({
      next: (data: CatPost[]) => {
        this.cats.set(data);

        // Deriva i marker dai dati dei gatti e imposta il signal
        this.catMarkers.set(data.map(cat => ({
          id: cat.id,
          lat: parseFloat(cat.latitude || '0'),
          lng: parseFloat(cat.longitude || '0'),
          title: cat.title,
          description: cat.description ? cat.description + '...' : '',
          imageUrl: 'assets/MarkerCats.png',
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Impossibile caricare gli avvistamenti dei gatti.');
        this.isLoading.set(false);
        console.error('Errore caricamento gatti:', err);
      }
    });
  }
}