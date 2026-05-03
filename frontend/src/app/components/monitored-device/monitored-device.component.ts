import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-monitored-device',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-netflix-dark flex items-center justify-center p-8">
      <div class="max-w-md w-full bg-netflix-darker rounded-lg p-8 text-center shadow-2xl">
        <div class="mb-6">
          <div class="w-20 h-20 bg-netflix-red rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="w-4 h-4 bg-white rounded-full animate-pulse" *ngIf="isStreaming"></span>
            <svg *ngIf="!isStreaming" class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">Monitoring Active</h1>
          <p class="text-gray-400">This device is being monitored for testing purposes.</p>
        </div>

        <div class="space-y-4">
          <div *ngIf="errorMessage" class="bg-red-900/50 text-red-200 p-4 rounded text-sm mb-4">
            {{ errorMessage }}
          </div>
          
          <div class="flex items-center justify-between bg-netflix-gray p-4 rounded">
            <span class="text-white">Camera & Microphone</span>
            <span class="px-2 py-1 rounded text-xs" [ngClass]="isStreaming ? 'bg-green-600' : 'bg-yellow-600'">
              {{ isStreaming ? 'STREAMING' : 'INITIALIZING...' }}
            </span>
          </div>

          <button *ngIf="!isStreaming" 
                  (click)="startMonitoring()"
                  class="w-full bg-netflix-red text-white py-3 rounded font-bold hover:bg-red-700 transition">
            Enable Camera & Mic
          </button>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-800 text-xs text-gray-500">
          Device ID: {{ deviceId }}
        </div>
      </div>
    </div>
  `
})
export class MonitoredDeviceComponent implements OnInit, OnDestroy {
  isStreaming = false;
  deviceId = '';
  errorMessage = '';

  constructor(private monitorService: MonitorService) {
    this.deviceId = localStorage.getItem('monitor_device_id') || 'Initializing...';
  }

  ngOnInit() {
    this.startMonitoring();
  }

  ngOnDestroy() {
    this.monitorService.stopStreaming();
  }

  async startMonitoring() {
    try {
      this.monitorService.registerDevice();
      await this.monitorService.startStreaming();
      this.isStreaming = true;
      this.deviceId = localStorage.getItem('monitor_device_id') || 'Unknown';
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      alert('Camera and Microphone access is required for monitoring.');
    }
  }
}
