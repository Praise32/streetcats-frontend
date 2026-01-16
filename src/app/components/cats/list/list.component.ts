import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, MapMarker } from '../../../shared/map/map.component';
import { CatService } from '../../../services/cat.service';
import { CatPost, PaginatedResponse } from '../../../interfaces/modules';
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

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize));

  constructor(private readonly catService: CatService) { }

  ngOnInit(): void {
    this.loadCats();
  }

  private loadCats(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catService.getAllCats(this.currentPage(), this.pageSize).subscribe({
      next: (response: PaginatedResponse<CatPost>) => {
        this.cats.set(response.data || []);
        this.totalItems.set(response.total || 0);
        this.catMarkers.set((response.data || []).map((cat: CatPost) => ({
          id: cat.id,
          lat: Number.parseFloat(cat.latitude || '0'),
          lng: Number.parseFloat(cat.longitude || '0'),
          title: cat.title,
          description: this.truncateDescription(cat.description),
          imageUrl: 'assets/MarkerCats.png',
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Impossibile caricare gli avvistamenti.');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadCats();
  }

  onImageLoad(catId: string | number): void {
    this.loadedImages.add(catId);
  }

  isLoaded(catId: string | number): boolean {
    return this.loadedImages.has(catId);
  }

  private truncateDescription(description: string | null): string {
    if (!description) return '';
    return description.length > 80 ? description.substring(0, 80) + '...' : description;
  }
}
