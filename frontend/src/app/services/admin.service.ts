import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video } from './video.service';
import { User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/admin' 
    : 'https://teleplayer.onrender.com/admin';

  constructor(private http: HttpClient) {}

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos`);
  }

  updateVideo(id: number, data: Partial<Video>): Observable<Video> {
    return this.http.put<Video>(`${this.apiUrl}/video/${id}`, data);
  }

  deleteVideo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/video/${id}`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/${id}`);
  }
}
