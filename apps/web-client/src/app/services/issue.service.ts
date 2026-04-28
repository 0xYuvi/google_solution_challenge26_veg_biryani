import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, switchMap, from } from 'rxjs';
import { AuthService } from './auth.service';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: number;
  status: string;
  city: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/issues`;
  private aiUrl = `${environment.apiUrl}/ai`;

  private getAuthHeaders(): Observable<HttpHeaders> {
    const user = this.authService.getCurrentUser();
    return from(user ? user.getIdToken() : Promise.resolve('')).pipe(
      map(token => new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }))
    );
  }

  getIssues(): Observable<Issue[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<{ success: boolean, data: Issue[] }>(this.apiUrl, { headers })),
      map(res => res.data)
    );
  }

  reportIssue(text: string, location: { lat: number, lng: number, city: string }): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post(`${this.aiUrl}/process-field-report`, {
        text,
        ...location
      }, { headers }))
    );
  }
}
