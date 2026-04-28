import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="min-h-screen bg-netflix-dark flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <div class="backdrop-blur-md bg-black bg-opacity-70 rounded-lg p-8">
          <h1 class="text-3xl font-bold mb-8 text-center">TELPLAYER</h1>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm mb-2">Email</label>
              <input 
                [(ngModel)]="email" 
                name="email"
                type="email" 
                class="w-full px-4 py-2 bg-netflix-gray rounded text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label class="block text-sm mb-2">Password</label>
              <input 
                [(ngModel)]="password" 
                name="password"
                type="password" 
                class="w-full px-4 py-2 bg-netflix-gray rounded text-white focus:outline-none focus:ring-2 focus:ring-netflix-red"
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit"
              [disabled]="loading"
              class="w-full bg-netflix-red text-white py-2 rounded font-bold hover:bg-red-700 transition disabled:opacity-50"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>

          <p class="text-center text-sm mt-4">
            Don't have an account? 
            <button (click)="toggleMode()" class="text-netflix-red hover:underline">Register</button>
          </p>

          <div *ngIf="error" class="mt-4 p-3 bg-red-900 bg-opacity-50 rounded text-red-300 text-sm">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginFormComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  isRegister = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.error = '';
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    const operation = this.isRegister 
      ? this.authService.register(this.email, this.password)
      : this.authService.login(this.email, this.password);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.error || 'An error occurred';
        this.loading = false;
      }
    });
  }
}
