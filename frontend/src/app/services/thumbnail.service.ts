import { Injectable, ElementRef } from '@angular/core';
import { Video, VideoService } from './video.service';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailService {
  private videoEl?: HTMLVideoElement;
  private canvasEl?: HTMLCanvasElement;

  constructor(
    private videoService: VideoService,
    private adminService: AdminService
  ) {
    // Create elements dynamically
    if (typeof document !== 'undefined') {
      this.videoEl = document.createElement('video');
      this.videoEl.style.display = 'none';
      this.videoEl.muted = true;
      this.videoEl.crossOrigin = 'anonymous';

      this.canvasEl = document.createElement('canvas');
      this.canvasEl.style.display = 'none';
    }
  }

  async generateMissingThumbnails(videos: Video[]) {
    if (!this.videoEl || !this.canvasEl) return;

    for (const video of videos) {
      if (!video.thumbnail) {
        await this.generateThumbnail(video);
      }
    }
  }

  private generateThumbnail(video: Video): Promise<void> {
    return new Promise((resolve) => {
      if (!this.videoEl || !this.canvasEl) return resolve();

      const videoEl = this.videoEl;
      const canvasEl = this.canvasEl;
      const streamUrl = this.videoService.getStreamUrl(video.id);

      videoEl.src = streamUrl;
      videoEl.currentTime = 1.0; // Try 1 second instead of 2

      const onSeeked = () => {
        // Wait a tiny bit for the frame to actually render
        setTimeout(() => {
          videoEl.pause();
          canvasEl.width = videoEl.videoWidth || 1280;
          canvasEl.height = videoEl.videoHeight || 720;
          const ctx = canvasEl.getContext('2d');
          
          if (ctx && videoEl.videoWidth > 0) {
            ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
            const base64Thumb = canvasEl.toDataURL('image/jpeg', 0.7);
            
            // Check if the image is mostly black/empty
            // (Simple check: if we got a valid DataURL)
            if (base64Thumb.length > 1000) {
              video.thumbnail = base64Thumb;
              this.adminService.updateVideo(video.id, video).subscribe({
                next: () => console.log(`Thumbnail generated for video ${video.id}`),
                error: () => console.error(`Failed to update thumbnail for video ${video.id}`)
              });
            }
          }
          cleanup();
          resolve();
        }, 500);
      };

      const onError = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        videoEl.removeEventListener('seeked', onSeeked);
        videoEl.removeEventListener('error', onError);
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      };

      videoEl.addEventListener('seeked', onSeeked);
      videoEl.addEventListener('error', onError);
      videoEl.load(); // Ensure it starts loading
    });
  }
}
