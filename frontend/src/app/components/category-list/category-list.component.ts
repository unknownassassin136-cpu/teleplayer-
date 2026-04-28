import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto pb-4 mb-8">
      <div class="flex gap-3 min-w-max">
        <button 
          *ngFor="let category of categories"
          (click)="selectCategory(category)"
          [class.bg-netflix-red]="selectedCategory === category"
          [class.bg-netflix-gray]="selectedCategory !== category"
          class="px-6 py-2 rounded whitespace-nowrap hover:bg-netflix-red transition"
        >
          {{ category }}
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class CategoryListComponent {
  @Input() categories: string[] = [];
  @Input() selectedCategory = 'All';
  @Output() categorySelected = new EventEmitter<string>();

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.categorySelected.emit(category);
  }
}
