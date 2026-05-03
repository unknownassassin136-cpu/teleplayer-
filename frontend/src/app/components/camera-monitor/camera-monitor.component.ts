import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-camera-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-black rounded-lg overflow-hidden aspect-video relative group">
      <img [src]="currentFrame" class="w-full h-full object-cover" *ngIf="currentFrame">
      <div class="absolute inset-0 bg-black/50 flex items-center justify-center transition" *ngIf="!isStreaming || !currentFrame">
        <p class="text-white">Waiting for stream...</p>
      </div>
      <div class="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1" *ngIf="isStreaming">
        <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        LIVE
      </div>
    </div>
  `
})
export class CameraMonitorComponent implements OnInit, OnChanges {
  @Input() selectedDevice: any;
  isStreaming = false;
  currentFrame: string | null = null;
  private timeoutId: any;

  constructor(private monitorService: MonitorService) {}

  ngOnInit() {
    this.monitorService.getStreamData().subscribe((data: any) => {
      // Check if it's the new 'video_frame' type
      if (this.selectedDevice && data.deviceId === this.selectedDevice.id && data.streamType === 'video_frame') {
        this.handleFrameData(data.blob);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDevice'] && this.selectedDevice) {
      this.isStreaming = false;
      this.currentFrame = null;
    }
  }

  private handleFrameData(base64Data: string) {
    this.isStreaming = true;
    this.currentFrame = base64Data;
    
    // Auto-reset streaming status if no frames received for 3 seconds
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.isStreaming = false;
    }, 3000);
  }
}
