import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VideoService, Video } from '../../services/video.service';
import { VideoPlayerComponent } from '../../components/video-player/video-player.component';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, VideoPlayerComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-netflix-dark">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav class="mb-6">
          <a routerLink="/" class="text-netflix-red hover:underline">← Back to Home</a>
        </nav>

        <div *ngIf="video; else loading" class="space-y-6">
          <!-- Video Player -->
          <app-video-player [streamUrl]="streamUrl"></app-video-player>

          <!-- Video Details -->
          <div class="bg-netflix-darker rounded-lg p-6">
            <h1 class="text-3xl font-bold mb-2">{{ video.title }}</h1>
            <p class="text-gray-400 mb-4">{{ video.category }}</p>
            <p class="text-gray-300 leading-relaxed">{{ video.description }}</p>
            
            <div class="mt-4 flex gap-4 text-sm text-gray-400">
              <span *ngIf="video.duration">Duration: {{ formatDuration(video.duration) }}</span>
              <span>Uploaded: {{ formatDate(video.uploaded_at) }}</span>
            </div>
          </div>
        </div>

        <ng-template #loading>
          <div class="text-center py-12">
            <p class="text-gray-400">Loading video...</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class PlayerComponent implements OnInit {
  video: Video | null = null;
  streamUrl = '';

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadVideo(id);
    });
  }

  loadVideo(id: number) {
    this.videoService.getVideo(id).subscribe({
      next: (video) => {
        this.video = video;
        this.streamUrl = this.videoService.getStreamUrl(id);
      }
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
