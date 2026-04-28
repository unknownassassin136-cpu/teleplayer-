import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Video } from '../../services/video.service';
import { User } from '../../services/auth.service';
import { Subscription, timer } from 'rxjs';
import { VideoService } from '../../services/video.service';
import { ThumbnailService } from '../../services/thumbnail.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-netflix-dark">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div class="grid grid-cols-2 gap-8">
          <!-- Videos Management -->
          <div class="bg-netflix-darker rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-4">Videos</h2>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              <div *ngFor="let video of videos" class="bg-netflix-gray p-4 rounded">
                <input 
                  [(ngModel)]="video.title" 
                  class="w-full px-2 py-1 bg-black text-white rounded mb-2"
                />
                <input 
                  [(ngModel)]="video.category" 
                  placeholder="Category"
                  class="w-full px-2 py-1 bg-black text-white rounded mb-2"
                />
                <textarea 
                  [(ngModel)]="video.description" 
                  placeholder="Description"
                  class="w-full px-2 py-1 bg-black text-white rounded mb-2"
                ></textarea>
                <div class="flex gap-2">
                  <button 
                    (click)="updateVideo(video)"
                    class="flex-1 bg-netflix-red px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Save
                  </button>
                  <button 
                    (click)="deleteVideo(video.id)"
                    class="flex-1 bg-red-900 px-3 py-1 rounded hover:bg-red-800 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Management -->
          <div class="bg-netflix-darker rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-4">Users</h2>
            <div class="space-y-4 max-h-96 overflow-y-auto">
              <div *ngFor="let user of users" class="bg-netflix-gray p-4 rounded flex justify-between items-center">
                <div>
                  <p class="font-bold">{{ user.email }}</p>
                  <p class="text-sm text-gray-400">{{ user.role }}</p>
                </div>
                <button 
                  (click)="deleteUser(user.id)"
                  class="bg-red-900 px-3 py-1 rounded hover:bg-red-800 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  videos: Video[] = [];
  users: User[] = [];
  private pollingSub?: Subscription;

  constructor(
    private adminService: AdminService,
    private videoService: VideoService,
    private thumbnailService: ThumbnailService
  ) {}

  ngOnInit() {
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  startPolling() {
    this.pollingSub = timer(0, 5000).subscribe(() => {
      this.loadVideos();
      this.loadUsers();
    });
  }

  loadVideos() {
    this.adminService.getVideos().subscribe({
      next: (videos) => {
        this.videos = videos;
        // Generate thumbnails automatically
        this.thumbnailService.generateMissingThumbnails(this.videos);
      }
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      }
    });
  }

  updateVideo(video: Video) {
    this.adminService.updateVideo(video.id, video).subscribe({
      next: () => {
        alert('Video updated successfully!');
      },
      error: () => {
        alert('Failed to update video');
      }
    });
  }

  deleteVideo(id: number) {
    if (confirm('Are you sure you want to delete this video?')) {
      this.adminService.deleteVideo(id).subscribe({
        next: () => {
          this.videos = this.videos.filter(v => v.id !== id);
        }
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
        }
      });
    }
  }
}
