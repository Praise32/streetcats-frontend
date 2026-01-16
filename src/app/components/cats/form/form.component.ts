import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatService } from '../../../services/cat.service';
import { MapComponent } from '../../../shared/map/map.component';
import { CatPost, CatPostInsertData } from '../../../interfaces/modules';
import { MarkdownModule } from 'ngx-markdown';
import { Observable } from 'rxjs';
import { QuillModule } from 'ngx-quill';
import { GeocodingService } from '../../../services/revgeocoding.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-cat-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MapComponent,
    MarkdownModule,
    QuillModule,
    ConfirmDialogComponent
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
  addressSuggestions: any[] = [];
  existingPhotos: { id: number, url: string, filename: string }[] = [];

  // Gestione dialog conferma
  showDeletePhotoDialog = false;
  photoToDeleteId: number | null = null;
  showSubmitDialog = false;
  pendingCatData: CatPostInsertData | null = null;

  selectedCoords = signal<{ lat: number, lng: number } | null>(null);
  fileNames: any;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly catService: CatService,
    private readonly geocodingService: GeocodingService,
    private readonly http: HttpClient,
    private readonly toastr: ToastrService
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
        this.loadCatForEdit(this.catIdToEdit);
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
            lat: Number.parseFloat(cat.latitude),
            lng: Number.parseFloat(cat.longitude)
          });
        }
        // Salva le foto già caricate
        this.existingPhotos = (cat.photos || []).map(photo => ({
          id: photo.id,
          url: photo.url,
          filename: photo.filename
        }));
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = 'Impossibile caricare i dati. Riprova.';
        this.errorMessage.set(msg);
        this.toastr.error(msg, 'Errore di caricamento');
        this.isLoading.set(false);
      }
    });
  }

  // Apre dialog conferma eliminazione foto
  removeExistingPhoto(photoId: number) {
    this.photoToDeleteId = photoId;
    this.showDeletePhotoDialog = true;
  }

  // Conferma eliminazione foto
  confirmDeletePhoto(): void {
    this.showDeletePhotoDialog = false;
    if (!this.photoToDeleteId) return;

    this.catService.deletePhoto(this.photoToDeleteId).subscribe({
      next: () => {
        this.existingPhotos = this.existingPhotos.filter(p => p.id !== this.photoToDeleteId);
        this.toastr.success('Foto eliminata con successo', 'Fatto');
        this.photoToDeleteId = null;
      },
      error: () => {
        this.toastr.error('Impossibile eliminare la foto', 'Errore');
        this.photoToDeleteId = null;
      }
    });
  }

  cancelDeletePhoto(): void {
    this.showDeletePhotoDialog = false;
    this.photoToDeleteId = null;
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

    // Reverse geocoding
    this.geocodingService.reverseGeocode(coords.lat, coords.lng).subscribe(data => {
      this.catForm.patchValue({
        address: data.address,
        city: data.city,
        cap: data.cap
      });
    });

    this.catForm.get('latitude')?.markAsDirty(); // Marca come modificato
    this.catForm.get('longitude')?.markAsDirty();
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (!this.catForm.valid) {
      this.toastr.warning('Compila tutti i campi richiesti', 'Attenzione');
      this.catForm.markAllAsTouched();
      return;
    }
    if (!this.selectedCoords() && !this.isEditMode()) {
      this.toastr.warning('Seleziona una posizione sulla mappa', 'Attenzione');
      return;
    }

    this.pendingCatData = {
      title: this.catForm.get('title')!.value,
      description: this.catForm.get('description')!.value,
      address: this.catForm.get('address')!.value,
      city: this.catForm.get('city')!.value,
      cap: Number(this.catForm.get('cap')!.value),
      latitude: this.catForm.get('latitude')!.value,
      longitude: this.catForm.get('longitude')!.value,
    };
    this.showSubmitDialog = true;
  }

  confirmSubmit(): void {
    this.showSubmitDialog = false;
    if (!this.pendingCatData) return;

    this.isLoading.set(true);
    const catData = this.pendingCatData;

    let operation$: Observable<CatPost>;

    if (this.isEditMode() && this.catIdToEdit !== null) {
      operation$ = this.catService.updateCat(this.catIdToEdit, catData);
    } else {
      operation$ = this.catService.createCat(catData);
    }

    operation$.subscribe({
      next: (responseCat) => {
        const successMsg = this.isEditMode() ? 'Avvistamento modificato!' : 'Avvistamento creato!';
        if (this.selectedFiles().length > 0) {
          const formData = new FormData();
          this.selectedFiles().forEach(file => {
            formData.append('imageFiles', file);
          });
          this.catService.uploadPhotos(responseCat.id, formData).subscribe({
            next: () => {
              this.toastr.success(successMsg, 'Successo');
              this.router.navigate(['/cats', responseCat.id]);
              this.isLoading.set(false);
            },
            error: () => {
              this.toastr.warning('Post salvato, ma errore nel caricamento foto', 'Attenzione');
              this.router.navigate(['/cats', responseCat.id]);
              this.isLoading.set(false);
            }
          });
        } else {
          this.toastr.success(successMsg, 'Successo');
          this.router.navigate(['/cats', responseCat.id]);
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toastr.error('Impossibile salvare l\'avvistamento. Riprova.', 'Errore');
        this.isLoading.set(false);
      }
    });
  }

  cancelSubmit(): void {
    this.showSubmitDialog = false;
    this.pendingCatData = null;
  }

  get selectedFileNames(): string {
    return this.selectedFiles().map(f => f.name).join(', ');
  }

  onAddressInput(value: string) {
    const city = this.catForm.get('city')?.value;
    const cap = this.catForm.get('cap')?.value;
    if (value.length > 3 && city) {
      const query = encodeURIComponent(`${value}, ${cap ? cap + ' ' : ''}${city}, Italia`);
      this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${query}&limit=5`)
        .subscribe(results => {
          this.addressSuggestions = results;
        });
    } else {
      this.addressSuggestions = [];
    }
  }
  selectAddressSuggestion(suggestion: any) {
    this.catForm.patchValue({
      address: suggestion.address.road + (suggestion.address.house_number ? ' ' + suggestion.address.house_number : ''),
      city: suggestion.address.city || suggestion.address.town || suggestion.address.village || '',
      cap: suggestion.address.postcode || ''
    });
    this.addressSuggestions = [];
    // Puoi anche aggiornare le coordinate se vuoi:
    this.catForm.patchValue({
      latitude: suggestion.lat,
      longitude: suggestion.lon
    });
    // Aggiorna la mappa se necessario
    this.onAddressFieldsChange();
  }

  onAddressFieldsChange() {
    const address = this.catForm.get('address')?.value;
    const city = this.catForm.get('city')?.value;
    const cap = this.catForm.get('cap')?.value;
    if (address && city) {
      const query = encodeURIComponent(`${address}, ${cap ? cap + ' ' : ''}${city}, Italia`);
      this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
        .subscribe(results => {
          if (results && results.length > 0) {
            const lat = Number.parseFloat(results[0].lat);
            const lng = Number.parseFloat(results[0].lon);
            this.selectedCoords.set({ lat, lng });
            this.catForm.patchValue({ latitude: lat.toString(), longitude: lng.toString() });
          }
        });
    }
  }
}