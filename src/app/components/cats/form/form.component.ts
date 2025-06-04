import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatService } from '../../../services/cat.service';
import { MapComponent } from '../../../shared/map/map.component';
import { CatPost, CatPostInsertData } from '../../../interfaces/modules';
import { MarkdownModule } from 'ngx-markdown'; // Per un'anteprima Markdown (se vuoi)
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cat-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MapComponent,
    MarkdownModule // Utile per un'anteprima markdown in tempo reale
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class CatFormComponent implements OnInit {
  catForm: FormGroup;
  isEditMode = signal(false);
  catIdToEdit: number | null = null;
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);

  // Signal per le coordinate selezionate sulla mappa
  selectedCoords = signal<{ lat: number, lng: number } | null>(null);
  fileNames: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catService: CatService
  ) {
    this.catForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      cap: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
      latitude: new FormControl('', Validators.required),
      longitude: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.catIdToEdit = Number(id);
        this.loadCatForEdit(this.catIdToEdit!);
      }
    });
  }

  private loadCatForEdit(id: number): void {
    this.isLoading.set(true);
    this.catService.getCatById(id).subscribe({
      next: (cat: CatPost) => {
        this.catForm.patchValue({
          title: cat.title,
          description: cat.description,
          address: cat.address,
          city: cat.city,
          cap: cat.cap,
          latitude: cat.latitude,
          longitude: cat.longitude,
        });
        // Imposta le coordinate selezionate per visualizzarle sulla mappa
        if (cat.latitude && cat.longitude) {
          this.selectedCoords.set({
            lat: parseFloat(cat.latitude),
            lng: parseFloat(cat.longitude)
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Errore durante il caricamento del gatto per la modifica.');
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files).filter(file => file.type.startsWith('image/'));
      this.selectedFiles.set(files);

      // Genera le anteprime
      const previews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          previews.push(e.target.result);
          // Aggiorna il signal solo quando tutte le anteprime sono pronte
          if (previews.length === files.length) {
            this.imagePreviews.set(previews);
          }
        };
        reader.readAsDataURL(file);
      });

      if (files.length > 5) {
        this.errorMessage.set('Puoi caricare al massimo 5 foto.');
      } else {
        this.errorMessage.set(null);
      }
    } else {
      this.selectedFiles.set([]);
      this.imagePreviews.set([]);
      this.errorMessage.set(null);
    }
  }

  removeImage(index: number): void {
    const files = [...this.selectedFiles()];
    const previews = [...this.imagePreviews()];
    files.splice(index, 1);
    previews.splice(index, 1);
    this.selectedFiles.set(files);
    this.imagePreviews.set(previews);
  }

  onMapClick(coords: { lat: number, lng: number }): void {
    this.selectedCoords.set(coords);
    this.catForm.patchValue({
      latitude: coords.lat.toString(),
      longitude: coords.lng.toString()
    });
    this.catForm.get('latitude')?.markAsDirty(); // Marca come modificato
    this.catForm.get('longitude')?.markAsDirty();
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (!this.catForm.valid) {
      this.errorMessage.set('Per favore, compila tutti i campi richiesti.');
      return;
    }
    if (!this.selectedCoords() && !this.isEditMode()) {
      this.errorMessage.set('Per favore, seleziona una posizione sulla mappa.');
      return;
    }

    this.isLoading.set(true);

    const catData: CatPostInsertData = {
      title: this.catForm.get('title')!.value,
      description: this.catForm.get('description')!.value,
      address: this.catForm.get('address')!.value,
      city: this.catForm.get('city')!.value,
      cap: Number(this.catForm.get('cap')!.value),
      latitude: this.catForm.get('latitude')!.value,
      longitude: this.catForm.get('longitude')!.value,
    };

    let operation$: Observable<CatPost>;

    if (this.isEditMode() && this.catIdToEdit !== null) {
      operation$ = this.catService.updateCat(this.catIdToEdit, catData);
    } else {
      operation$ = this.catService.createCat(catData);
    }

    operation$.subscribe({
      next: (responseCat) => {
        // Se ci sono file selezionati, carica tutte le foto
        if (this.selectedFiles().length > 0) {
          const formData = new FormData();
          this.selectedFiles().forEach(file => {
            formData.append('imageFiles', file); // 'imageFiles' deve essere un array nel backend
          });
          this.catService.uploadPhotos(responseCat.id, formData).subscribe({
            next: (photoResponse) => {
              this.router.navigate(['/cats', responseCat.id]);
              this.isLoading.set(false);
            },
            error: (err) => {
              this.errorMessage.set(err.message || 'Gatto salvato, ma errore durante il caricamento delle foto.');
              this.isLoading.set(false);
            }
          });
        } else {
          this.router.navigate(['/cats', responseCat.id]);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Errore durante il salvataggio del gatto.');
        this.isLoading.set(false);
      }
    });
  }

  get selectedFileNames(): string {
    return this.selectedFiles().map(f => f.name).join(', ');
  }
}