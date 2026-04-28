import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService, Video } from '../../services/video.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { VideoCardComponent } from '../../components/video-card/video-card.component';
import { CategoryListComponent } from '../../components/category-list/category-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, CategoryListComponent],
  template: `
    <div class="min-h-screen bg-netflix-dark">
      <!-- Hero Banner -->
      <div class="relative h-96 bg-gradient-to-r from-netflix-dark to-netflix-red flex items-center justify-center overflow-hidden">
        <div class="text-center z-10">
          <h1 class="text-5xl font-bold mb-4">Welcome to TELPLAYER</h1>
          <p class="text-xl text-gray-300">Stream unlimited videos from Telegram</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Categories -->
        <app-category-list 
          [categories]="categories"
          [selectedCategory]="selectedCategory"
          (categorySelected)="onCategorySelect($event)"
        ></app-category-list>

        <!-- Videos Grid -->
        <div *ngIf="videos.length > 0; else noVideos" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <app-video-card *ngFor="let video of videos" [video]="video"></app-video-card>
        </div>

        <ng-template #noVideos>
          <div class="text-center py-12">
            <p class="text-gray-400">No videos available. Check back soon!</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit, OnDestroy {
  videos: Video[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  loading = true;
  private pollingSubscription?: Subscription;

  constructor(private videoService: VideoService) {}

  ngOnInit() {
    this.startPolling();
    this.loadCategories();
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  startPolling() {
    this.loading = true;
    this.pollingSubscription = timer(0, 5000)
      .pipe(
        switchMap(() => {
          if (this.selectedCategory === 'All') {
            return this.videoService.getVideos();
          } else {
            return this.videoService.getVideosByCategory(this.selectedCategory);
          }
        })
      )
      .subscribe({
        next: (videos) => {
          this.videos = videos;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  loadVideos() {
    // Only used for immediate refresh if needed
    this.startPolling();
  }

  loadCategories() {
    this.videoService.getCategories().subscribe({
      next: (categories) => {
        this.categories = ['All', ...categories];
      }
    });
  }

  onCategorySelect(category: string) {
    this.selectedCategory = category;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    this.startPolling();
  }
}
