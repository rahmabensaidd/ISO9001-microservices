import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class PostCommentService {
  private apiUrl = 'http://localhost:8089/api/posts';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap((token: string) => {
        if (!token) {
          return throwError(() => new Error('No token available'));
        }
        return of(
          new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
        );
      }),
      catchError((err) => throwError(() => err))
    );
  }

  getPostsByUserId(userId: string): Observable<Post[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Fetching posts for userId:', userId, 'with headers:', headers);
        return this.http.get<Post[]>(`${this.apiUrl}?userId=${userId}`, { headers });
      }),
      catchError((err) => {
        console.error('Error fetching posts:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Server error';
        return throwError(() => new Error(`Error fetching posts: ${errorMessage}`));
      })
    );
  }

  createPost(post: Post): Observable<Post> {
    if (!post.content || post.content.trim() === '') {
      return throwError(() => new Error('Post content is required'));
    }
    if (post.content.length > 500) {
      return throwError(() => new Error('Post content exceeds maximum length of 500 characters'));
    }
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const payload = { content: post.content };
        console.log('Creating post with payload:', payload, 'and headers:', headers);
        return this.http.post<Post>(this.apiUrl, payload, { headers });
      }),
      catchError((err) => {
        console.error('Error creating post:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Server error';
        return throwError(() => new Error(`Error creating post: ${errorMessage}`));
      })
    );
  }

  updatePost(postId: number, post: Post): Observable<Post> {
    if (!post.content || post.content.trim() === '') {
      return throwError(() => new Error('Post content is required'));
    }
    if (post.content.length > 500) {
      return throwError(() => new Error('Post content exceeds maximum length of 500 characters'));
    }
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Updating post:', postId, 'with headers:', headers);
        return this.http.put<Post>(`${this.apiUrl}/${postId}`, { content: post.content }, { headers });
      }),
      catchError((err) => {
        console.error('Error updating post:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Server error';
        return throwError(() => new Error(`Error updating post: ${errorMessage}`));
      })
    );
  }

  deletePost(postId: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Deleting post:', postId, 'with headers:', headers);
        return this.http.delete<void>(`${this.apiUrl}/${postId}`, { headers });
      }),
      catchError((err) => {
        console.error('Error deleting post:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Server error';
        return throwError(() => new Error(`Error deleting post: ${errorMessage}`));
      })
    );
  }

  addComment(postId: number, comment: Comment): Observable<Post> {
    if (!comment.text || comment.text.trim() === '') {
      return throwError(() => new Error('Comment text is required'));
    }
    if (comment.text.length > 500) {
      return throwError(() => new Error('Comment text exceeds maximum length of 500 characters'));
    }
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const payload = { text: comment.text };
        console.log('Adding comment to post:', postId, 'with payload:', payload, 'and headers:', headers);
        return this.http.post<Post>(`${this.apiUrl}/${postId}/comments`, payload, { headers });
      }),
      catchError((err) => {
        console.error('Error adding comment:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Server error';
        return throwError(() => new Error(`Error adding comment: ${errorMessage}`));
      })
    );
  }

  updateComment(postId: number, commentId: number, comment: Comment): Observable<Post> {
    if (!comment.text || comment.text.trim() === '') {
      return throwError(() => new Error('Comment text is required'));
    }
    if (comment.text.length > 500) {
      return throwError(() => new Error('Comment text exceeds maximum length of 500 characters'));
    }
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const payload = { text: comment.text };
        console.log('Updating comment:', commentId, 'on post:', postId, 'with payload:', payload, 'and headers:', headers);
        return this.http.put<Post>(`${this.apiUrl}/${postId}/comments/${commentId}`, payload, { headers });
      }),
      catchError((err) => {
        console.error('Error updating comment:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Server error';
        return throwError(() => new Error(`Error updating comment: ${errorMessage}`));
      })
    );
  }

  deleteComment(postId: number, commentId: number): Observable<Post> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Deleting comment:', commentId, 'on post:', postId, 'with headers:', headers);
        return this.http.delete<Post>(`${this.apiUrl}/${postId}/comments/${commentId}`, { headers });
      }),
      catchError((err) => {
        console.error('Error deleting comment:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Server error';
        return throwError(() => new Error(`Error deleting comment: ${errorMessage}`));
      })
    );
  }

  addReply(postId: number, commentId: number, reply: Comment): Observable<Post> {
    if (!reply.text || reply.text.trim() === '') {
      return throwError(() => new Error('Reply text is required'));
    }
    if (reply.text.length > 500) {
      return throwError(() => new Error('Reply text exceeds maximum length of 500 characters'));
    }
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const payload = { text: reply.text };
        console.log('Adding reply to comment:', commentId, 'on post:', postId, 'with payload:', payload, 'and headers:', headers);
        return this.http.post<Post>(`${this.apiUrl}/${postId}/comments/${commentId}/replies`, payload, { headers });
      }),
      catchError((err) => {
        console.error('Error adding reply:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Server error';
        return throwError(() => new Error(`Error adding reply: ${errorMessage}`));
      })
    );
  }
}

export interface Post {
  id?: number;
  content: string;
  user?: { id: string; username: string };
  createdAt?: string;
  comments?: Comment[];
}

export interface Comment {
  id?: number;
  text: string;
  user?: { id: string; username: string };
  createdAt?: string;
  replies?: Comment[];
}
