import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-netflix-darker rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">Connected Devices</h2>
      <div class="space-y-4">
        <div *ngFor="let device of devices" 
             class="bg-netflix-gray p-4 rounded flex justify-between items-center cursor-pointer hover:bg-gray-700 transition"
             (click)="selectDevice(device)">
          <div>
            <p class="font-bold">{{ device.info.platform }}</p>
            <p class="text-xs text-gray-400">{{ device.deviceId }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            <span class="text-sm">Live</span>
          </div>
        </div>
        <div *ngIf="devices.length === 0" class="text-gray-500 text-center py-4">
          No devices connected
        </div>
      </div>
    </div>
  `
})
export class DeviceListComponent implements OnInit {
  devices: any[] = [];
  @Output() onSelect = new EventEmitter<any>();

  constructor(private monitorService: MonitorService) {}

  ngOnInit() {
    this.monitorService.getDeviceList().subscribe(devices => {
      this.devices = devices;
    });
    this.monitorService.registerAdmin();
  }

  selectDevice(device: any) {
    this.onSelect.emit(device);
  }
}
