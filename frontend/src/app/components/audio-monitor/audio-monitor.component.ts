import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-audio-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-netflix-darker rounded-lg p-6 flex flex-col items-center">
      <h3 class="text-lg font-bold mb-4">Live Microphone</h3>
      <div class="flex items-end gap-1 h-12">
        <div *ngFor="let bar of bars" 
             [style.height.%]="bar" 
             class="w-2 bg-netflix-red transition-all duration-100">
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-4" *ngIf="selectedDevice">Monitoring: {{ selectedDevice.deviceId }}</p>
    </div>
  `
})
export class AudioMonitorComponent implements OnInit {
  @Input() selectedDevice: any;
  bars = new Array(10).fill(10);

  constructor(private monitorService: MonitorService) {}

  ngOnInit() {
    // For visualization, we could analyze the audio data if sent separately
    // Since it's bundled with video in this implementation, we'll simulate the bars
    // or just show a simplified indicator.
    setInterval(() => {
      if (this.selectedDevice) {
        this.bars = this.bars.map(() => Math.random() * 80 + 20);
      } else {
        this.bars = this.bars.map(() => 10);
      }
    }, 200);
  }
}
