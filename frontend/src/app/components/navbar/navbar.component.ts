import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-netflix-darker border-b border-netflix-gray sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div class="flex items-center gap-8">
          <a routerLink="/" class="text-netflix-red text-2xl font-bold">▶ TELPLAYER</a>
        </div>

        <div class="hidden md:flex gap-6">
          <a routerLink="/" class="hover:text-netflix-red transition">Home</a>
          <a [routerLink]="['/']" class="hover:text-netflix-red transition">Categories</a>
          <a *ngIf="(currentUser$ | async)?.role === 'admin'" routerLink="/admin" class="text-netflix-red">Admin</a>
        </div>

        <div>
          <button *ngIf="currentUser$ | async" (click)="logout()" class="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition">
            Logout
          </button>
          <a *ngIf="!(currentUser$ | async)" routerLink="/login" class="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition inline-block">
            Login
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Component initialization
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
