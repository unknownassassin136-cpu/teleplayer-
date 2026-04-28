import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Video } from '../../services/video.service';
import { User } from '../../services/auth.service';
import { Subscription, timer } from 'rxjs';
import { VideoService } from '../../services/video.service';

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
      <!-- Hidden video element for thumbnail generation -->
      <video #thumbnailVideo style="display: none;" crossorigin="anonymous"></video>
      <canvas #thumbnailCanvas style="display: none;"></canvas>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  videos: Video[] = [];
  users: User[] = [];
  private pollingSub?: Subscription;

  @ViewChild('thumbnailVideo') thumbnailVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('thumbnailCanvas') thumbnailCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private adminService: AdminService,
    private videoService: VideoService
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
        // Deep compare or just replace. Since it's admin, replace is fine.
        this.videos = videos;
        
        // Check for missing thumbnails
        this.checkAndGenerateThumbnails();
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

  async checkAndGenerateThumbnails() {
    for (const video of this.videos) {
      if (!video.thumbnail) {
        await this.generateThumbnail(video);
      }
    }
  }

  generateThumbnail(video: Video): Promise<void> {
    return new Promise((resolve) => {
      const videoEl = this.thumbnailVideo.nativeElement;
      const canvasEl = this.thumbnailCanvas.nativeElement;
      const streamUrl = this.videoService.getStreamUrl(video.id);

      videoEl.src = streamUrl;
      videoEl.currentTime = 2.0; // Capture at 2 seconds
      videoEl.muted = true;
      videoEl.play().catch(() => {}); // Play slightly to buffer

      const onCanPlay = () => {
        videoEl.pause();
        canvasEl.width = videoEl.videoWidth || 1280;
        canvasEl.height = videoEl.videoHeight || 720;
        const ctx = canvasEl.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
          const base64Thumb = canvasEl.toDataURL('image/jpeg', 0.7);
          video.thumbnail = base64Thumb;
          this.adminService.updateVideo(video.id, video).subscribe({
            next: () => console.log(`Thumbnail generated for video ${video.id}`),
            error: () => console.error(`Failed to update thumbnail for video ${video.id}`)
          });
        }
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        resolve(); // resolve anyway to not block others
      };

      const cleanup = () => {
        videoEl.removeEventListener('canplay', onCanPlay);
        videoEl.removeEventListener('error', onError);
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      };

      videoEl.addEventListener('canplay', onCanPlay);
      videoEl.addEventListener('error', onError);
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
