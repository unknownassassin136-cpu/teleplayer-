import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceListComponent } from '../device-list/device-list.component';
import { CameraMonitorComponent } from '../camera-monitor/camera-monitor.component';
import { AudioMonitorComponent } from '../audio-monitor/audio-monitor.component';

@Component({
  selector: 'app-monitor-dashboard',
  standalone: true,
  imports: [CommonModule, DeviceListComponent, CameraMonitorComponent, AudioMonitorComponent],
  template: `
    <div class="min-h-screen bg-netflix-dark p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Device Monitor</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Device List -->
          <div class="lg:col-span-1">
            <app-device-list (onSelect)="selectedDevice = $event"></app-device-list>
          </div>
          
          <!-- Live Feeds -->
          <div class="lg:col-span-2 space-y-8">
            <div *ngIf="selectedDevice; else noSelection">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Live Feed: {{ selectedDevice.info.platform }}</h2>
                <button class="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition" (click)="selectedDevice = null">
                  Stop Monitoring
                </button>
              </div>
              
              <div class="space-y-8">
                <app-camera-monitor [selectedDevice]="selectedDevice"></app-camera-monitor>
                <app-audio-monitor [selectedDevice]="selectedDevice"></app-audio-monitor>
              </div>
            </div>
            
            <ng-template #noSelection>
              <div class="bg-netflix-darker rounded-lg p-12 text-center border-2 border-dashed border-gray-700">
                <p class="text-xl text-gray-500">Select a device from the list to start monitoring</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MonitorDashboardComponent {
  selectedDevice: any = null;
}
