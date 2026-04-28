import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Video } from '../../services/video.service';

@Component({
  selector: 'app-video-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div routerLink="/watch/{{ video.id }}" class="scale-hover cursor-pointer rounded-lg overflow-hidden bg-netflix-gray">
      <div class="relative pb-[56.25%] bg-black">
        <img 
          *ngIf="video.thumbnail"
          [src]="video.thumbnail" 
          alt="{{ video.title }}"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div *ngIf="!video.thumbnail" class="absolute inset-0 bg-gradient-to-r from-netflix-gray to-netflix-dark flex items-center justify-center">
          <span class="text-3xl">🎬</span>
        </div>
        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 flex items-center justify-center transition opacity-0 hover:opacity-100">
          <span class="text-4xl">▶</span>
        </div>
      <div class="p-4">
        <h3 class="font-bold text-sm truncate">{{ video.title }}</h3>
        <p class="text-xs text-gray-400 truncate">{{ video.category }}</p>
      </div>
  `,
  styles: []
})
export class VideoCardComponent {
  @Input() video!: Video;
}
