// src/app/cats/list/cat-list.component.ts
import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
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
  catMarkers = signal<MapMarker[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  cats = signal<CatPost[]>([]);
  currentPage = signal(1);
  pageSize = 6;
  totalItems = signal(0);
  loadedImages = new Set<string | number>();

  // Calcola il numero totale di pagine
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize));

  constructor(private catService: CatService) { }

  ngOnInit(): void {
    this.loadCats();
  }

  private loadCats(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catService.getAllCats(this.currentPage(), this.pageSize).subscribe({
      next: (response: any) => {
        // Adatta questa parte in base alla risposta del backend
        this.cats.set(response.data || []);
        this.totalItems.set(response.total || (response.data ? response.data.length : 0));

        this.catMarkers.set((response.data || []).map((cat: CatPost) => ({
          id: cat.id,
          lat: parseFloat(cat.latitude || '0'),
          lng: parseFloat(cat.longitude || '0'),
          title: cat.title,
          description: cat.description ? cat.description.substring(0, 80) + (cat.description.length > 80 ? '...' : '') : '',
          imageUrl: 'assets/MarkerCats.png',
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Impossibile caricare gli avvistamenti dei gatti.');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadCats();
  }


  onImageLoad(catId: string | number) {
    this.loadedImages.add(catId);
  }

  isLoaded(catId: string | number): boolean {
    return this.loadedImages.has(catId);
  }
}