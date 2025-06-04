// src/app/cats/detail/cat-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importa ActivatedRoute e RouterLink
import { CatService } from '../../../services/cat.service';
import { CatPost, Comment } from '../../../interfaces/modules';
import { MapComponent, MapMarker } from '../../../shared/map/map.component';
import { MarkdownModule } from 'ngx-markdown'; // Importa MarkdownModule
import { AuthService } from '../../../services/auth.service'; // Per controllare lo stato di login
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';



@Component({
  selector: 'app-cat-detail',
  standalone: true,
  imports: [
    CommonModule,
    MapComponent,
    MarkdownModule, // Aggiungi MarkdownModule qui
    RouterLink,
    ReactiveFormsModule // Per il form dei commenti
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class CatDetailComponent implements OnInit {
  catPost = signal<CatPost | null>(null); // Signal per il post del gatto
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  mapMarkers = signal<MapMarker[]>([]);
  mapCenter = signal<L.LatLngExpression>([0, 0]);
  mapZoom = signal(15);

  commentForm: FormGroup;
  isLoggedIn: any;

  @ViewChild('commentArea') commentArea!: ElementRef<HTMLTextAreaElement>;



  constructor(
    private route: ActivatedRoute,
    private catService: CatService,
    private authService: AuthService, // Inietta AuthService
    private router: Router
  ) {
    this.commentForm = new FormGroup({
      text: new FormControl('', Validators.required)
    });
    this.isLoggedIn = this.authService.isLoggedIn;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCatDetail(Number(id)); // Converti l'ID a numero
      } else {
        this.errorMessage.set('ID del gatto non fornito.');
        this.isLoading.set(false);
      }
    });
  }

  get isOwner(): boolean {
    const post = this.catPost();
    const user = this.authService.getCurrentUser?.(); // Assicurati che AuthService abbia questo metodo
    return !!post && !!user && post.userId === user.id;
  }

  onDeletePost(): void {
    if (confirm('Sei sicuro di voler eliminare questo avvistamento?')) {
      this.catService.deleteCat(this.catPost()!.id).subscribe({
        next: () => this.router.navigate(['/cats']),
        error: (err) => this.errorMessage.set(err.message || 'Errore durante l\'eliminazione del post.')
      });
    }
  }

  private loadCatDetail(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.catService.getCatById(id).subscribe({
      next: (data: CatPost) => {
        this.catPost.set(data);
        if (data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          this.mapCenter.set([lat, lng]);
          this.mapMarkers.set([
            {
              id: data.id,
              lat: lat,
              lng: lng,
              title: data.title,
              description: data.description || '',
              imageUrl: data.photos && data.photos.length > 0 ? data.photos[0].url : undefined
            }
          ]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Errore durante il caricamento dei dettagli del gatto.');
        this.isLoading.set(false);
        console.error('Errore caricamento dettagli gatto:', err);
      }
    });
  }

  onCommentSubmit(): void {
    if (this.commentForm.valid && this.catPost()) {
      const postId = this.catPost()!.id;
      const commentText = this.commentForm.get('text')!.value;

      this.catService.addComment(postId, commentText).subscribe({
        next: (newComment) => {
          // Aggiungi il nuovo commento alla lista dei commenti del post (aggiornando il signal)
          this.catPost.update(currentPost => {
            if (currentPost) {
              const updatedComments = currentPost.comments ? [...currentPost.comments, newComment] : [newComment];
              return { ...currentPost, comments: updatedComments };
            }
            return currentPost;
          });
          this.commentForm.reset(); // Resetta il form
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Errore durante l\'aggiunta del commento.');
          console.error('Errore aggiunta commento:', err);
        }
      });
    } else {
      this.errorMessage.set('Per favore, inserisci un commento valido.');
    }
  }

  // Helper per ottenere l'URL della prima foto o un placeholder
  getCatImageUrl(): string {
    const post = this.catPost();
    if (post && post.photos && post.photos.length > 0) {
      return post.photos[0].url;
    }
    return 'assets/placeholder-cat.jpg'; // Immagine placeholder
  }

  // Funzione per formattare la data
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  insertMarkdown(before: string, after: string) {
    const textarea = this.commentArea?.nativeElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    textarea.value = newValue;
    this.commentForm.get('text')?.setValue(newValue);
    // Riposiziona il cursore
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + before.length + selected.length + after.length;
    });
  }
}