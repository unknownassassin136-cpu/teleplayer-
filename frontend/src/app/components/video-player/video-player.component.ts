import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-video-player',
  standalone: true,
  template: `
    <div class="w-full bg-black rounded-lg overflow-hidden">
      <video 
        #videoPlayer
        controls
        class="w-full max-h-[75vh] object-contain bg-black"
        [src]="streamUrl"
        controlsList="nodownload"
      >
        Your browser does not support HTML5 video.
      </video>
    </div>
  `,
  styles: []
})
export class VideoPlayerComponent {
  @Input() streamUrl = '';
}
