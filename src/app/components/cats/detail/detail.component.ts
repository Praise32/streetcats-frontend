import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CatService } from '../../../services/cat.service';
import { CommentService } from '../../../services/comments.service';
import { CatPost, Comment, User } from '../../../interfaces/modules';
import { MapComponent, MapMarker } from '../../../shared/map/map.component';
import { MarkdownModule } from 'ngx-markdown';
import { AuthService } from '../../../services/auth.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';



@Component({
  selector: 'app-cat-detail',
  standalone: true,
  imports: [
    CommonModule,
    MapComponent,
    MarkdownModule,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    QuillModule,
    ConfirmDialogComponent
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class CatDetailComponent implements OnInit {
  catPost = signal<CatPost | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  mapMarkers = signal<MapMarker[]>([]);
  mapCenter = signal<L.LatLngExpression>([0, 0]);
  mapZoom = signal(15);

  commentForm: FormGroup;
  isLoggedIn: any;

  // Gestione dialog di conferma
  showDeletePostDialog = false;
  showDeleteCommentDialog = false;
  showAddCommentDialog = false;
  commentToDelete: Comment | null = null;
  pendingCommentText: string | null = null;

  // Gestione caricamento immagini
  loadedImages = new Set<string>();

  @ViewChild('commentArea') commentArea!: ElementRef<HTMLTextAreaElement>;



  constructor(
    private readonly route: ActivatedRoute,
    private readonly catService: CatService,
    public authService: AuthService,
    private readonly commentService: CommentService,
    private readonly router: Router,
    private readonly toastr: ToastrService
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
        this.loadCatDetail(Number(id));
      } else {
        this.errorMessage.set('ID non fornito.');
        this.isLoading.set(false);
      }
    });
  }

  get isOwner(): boolean {
    const post = this.catPost();
    const user = this.authService.getCurrentUser?.();
    return !!post && !!user && post.userId === user.id;
  }

  onDeletePost(): void {
    this.showDeletePostDialog = true;
  }

  confirmDeletePost(): void {
    this.showDeletePostDialog = false;
    this.catService.deleteCat(this.catPost()!.id).subscribe({
      next: () => {
        this.toastr.success('Avvistamento eliminato', 'Fatto');
        this.router.navigate(['/cats']);
      },
      error: () => {
        this.toastr.error('Impossibile eliminare', 'Errore');
      }
    });
  }

  cancelDeletePost(): void {
    this.showDeletePostDialog = false;
  }

  private loadCatDetail(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.catService.getCatById(id).subscribe({
      next: (data: CatPost) => {
        if (data.comments) {
          data.comments = [...data.comments].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        this.catPost.set(data);
        if (data.latitude && data.longitude) {
          const lat = Number.parseFloat(data.latitude);
          const lng = Number.parseFloat(data.longitude);
          this.mapCenter.set([lat, lng]);
          this.mapMarkers.set([
            {
              id: data.id,
              lat: lat,
              lng: lng,
              title: data.title,
              description: data.description || '',
              imageUrl: data.photos && data.photos.length > 0 ? data.photos[0].url : undefined,
              showDetailButton: false,
              address: `${data.address}, ${data.city} (${data.cap})`
            }
          ]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastr.error('Impossibile caricare i dettagli', 'Errore');
        this.errorMessage.set('Errore durante il caricamento.');
        this.isLoading.set(false);
      }
    });
  }

  onCommentSubmit(): void {
    if (this.commentForm.valid && this.catPost()) {
      this.pendingCommentText = this.commentForm.getRawValue().text;
      this.showAddCommentDialog = true;
    } else {
      this.toastr.warning('Inserisci un commento valido', 'Attenzione');
    }
  }

  confirmAddComment(): void {
    this.showAddCommentDialog = false;
    if (!this.pendingCommentText || !this.catPost()) return;

    const postId = this.catPost()!.id;
    const commentText = this.pendingCommentText;

    this.commentService.addComment(postId, commentText).subscribe({
      next: (newComment: Comment) => {
        this.catPost.update(currentPost => {
          if (currentPost) {
            const updatedComments = currentPost.comments
              ? [...currentPost.comments, newComment]
              : [newComment];
            updatedComments.sort((a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return { ...currentPost, comments: updatedComments };
          }
          return currentPost;
        });
        this.commentForm.reset();
        this.pendingCommentText = null;
        this.toastr.success('Commento aggiunto!', 'Fatto');
      },
      error: () => {
        this.toastr.error('Impossibile aggiungere il commento', 'Errore');
        this.pendingCommentText = null;
      }
    });
  }

  cancelAddComment(): void {
    this.showAddCommentDialog = false;
    this.pendingCommentText = null;
  }

  getCatImageUrl(): string {
    const post = this.catPost();
    if (post?.photos?.length) {
      return post.photos[0].url;
    }
    return '/assets/placeholder-cat.jpg';
  }

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

  insertMarkdown(before: string, after: string): void {
    const textarea = this.commentArea?.nativeElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    textarea.value = newValue;
    this.commentForm.get('text')?.setValue(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + before.length + selected.length + after.length;
    });
  }

  modalImageUrl: string | null = null;

  openImageModal(url: string): void {
    this.modalImageUrl = url;
  }

  closeImageModal(): void {
    this.modalImageUrl = null;
  }

  editingCommentId: number | null = null;
  editCommentForm: FormGroup = new FormGroup({
    text: new FormControl('', Validators.required)
  });

  onEditComment(comment: Comment): void {
    this.editingCommentId = comment.id;
    this.editCommentForm.setValue({ text: comment.text });
  }

  onUpdateComment(comment: Comment): void {
    if (this.editCommentForm.valid) {
      const newText = this.editCommentForm.get('text')?.value;
      const commentId = Number(comment.id);
      if (Number.isNaN(commentId)) {
        this.toastr.error('ID commento non valido', 'Errore');
        return;
      }
      this.commentService.updateComment(commentId, newText).subscribe({
        next: (updatedComment) => {
          this.catPost.update(currentPost => {
            if (!currentPost) return currentPost;
            const updatedComments = (currentPost.comments?.map(c =>
              c.id === updatedComment.id
                ? { ...c, text: updatedComment.text, updatedAt: updatedComment.updatedAt }
                : c
            ) || []).sort((a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return { ...currentPost, comments: updatedComments };
          });
          this.editingCommentId = null;
          this.toastr.success('Commento modificato', 'Fatto');
        },
        error: () => {
          this.toastr.error('Impossibile modificare il commento', 'Errore');
        }
      });
    }
  }

  // Annulla la modifica
  onCancelEditComment() {
    this.editingCommentId = null;
  }

  // Apre dialog conferma eliminazione commento
  onDeleteComment(comment: Comment) {
    this.commentToDelete = comment;
    this.showDeleteCommentDialog = true;
  }

  // Conferma eliminazione commento
  confirmDeleteComment(): void {
    this.showDeleteCommentDialog = false;
    if (!this.commentToDelete) return;
    
    this.commentService.deleteComment(this.commentToDelete.id).subscribe({
      next: () => {
        this.catPost.update(currentPost => {
          if (!currentPost) return currentPost;
          return {
            ...currentPost,
            comments: currentPost.comments?.filter(c => c.id !== this.commentToDelete!.id) || []
          };
        });
        this.toastr.success('Commento eliminato', 'Fatto');
        this.commentToDelete = null;
      },
      error: () => {
        this.toastr.error('Impossibile eliminare il commento', 'Errore');
        this.commentToDelete = null;
      }
    });
  }

  cancelDeleteComment(): void {
    this.showDeleteCommentDialog = false;
    this.commentToDelete = null;
  }

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  onImageLoad(url: string): void {
    this.loadedImages.add(url);
  }

  isImageLoaded(url: string): boolean {
    return this.loadedImages.has(url);
  }

}