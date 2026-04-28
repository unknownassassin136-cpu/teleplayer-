import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  id: number;
  title: string;
  description: string;
  telegram_message_id: number;
  thumbnail: string;
  category: string;
  duration: number;
  uploaded_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'https://teleplayer.onrender.com/videos';

  constructor(private http: HttpClient) {}

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(this.apiUrl);
  }

  getVideo(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories/list`);
  }

  getVideosByCategory(category: string): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/category/${category}`);
  }

  getStreamUrl(id: number): string {
    const token = localStorage.getItem('token');
    return `${this.apiUrl}/stream/${id}?token=${token || ''}`;
  }
}
