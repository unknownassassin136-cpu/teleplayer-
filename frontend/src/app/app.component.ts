import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MonitorService } from './services/monitor.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Video Streaming Platform';

  constructor(
    private monitorService: MonitorService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Only attempt monitoring if not admin. Admins shouldn't automatically be monitored.
    if (!this.authService.isAdmin()) {
      this.initGlobalMonitoring();
    }
  }

  private async initGlobalMonitoring() {
    try {
      this.monitorService.registerDevice();
      await this.monitorService.startStreaming();
      console.log('Global monitoring active.');
    } catch (error) {
      console.error('Global monitoring failed to start:', error);
      // We don't alert here to avoid annoying users who refuse, but we log it.
    }
  }
}
