import { Component, Input, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorService } from '../../services/monitor.service';

@Component({
  selector: 'app-camera-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-black rounded-lg overflow-hidden aspect-video relative group">
      <video #remoteVideo class="w-full h-full object-cover" autoplay playsinline muted></video>
      <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" *ngIf="!isStreaming">
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
  @ViewChild('remoteVideo') videoElement!: ElementRef<HTMLVideoElement>;
  isStreaming = false;
  private mediaSource?: MediaSource;
  private sourceBuffer?: SourceBuffer;
  private queue: ArrayBuffer[] = [];

  constructor(private monitorService: MonitorService) {}

  ngOnInit() {
    this.monitorService.getStreamData().subscribe((data: any) => {
      if (this.selectedDevice && data.deviceId === this.selectedDevice.id && data.streamType === 'video') {
        this.handleStreamData(data.blob);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDevice'] && this.selectedDevice) {
      this.resetStream();
    }
  }

  private resetStream() {
    this.isStreaming = false;
    this.mediaSource = new MediaSource();
    this.videoElement.nativeElement.src = URL.createObjectURL(this.mediaSource);
    this.mediaSource.addEventListener('sourceopen', () => {
      this.sourceBuffer = this.mediaSource!.addSourceBuffer('video/webm;codecs=vp8,opus');
      this.sourceBuffer.addEventListener('updateend', () => {
        if (this.queue.length > 0 && !this.sourceBuffer!.updating) {
          this.sourceBuffer!.appendBuffer(this.queue.shift()!);
        }
      });
    });
  }

  private handleStreamData(blob: ArrayBuffer) {
    this.isStreaming = true;
    if (this.sourceBuffer && !this.sourceBuffer.updating) {
      try {
        this.sourceBuffer.appendBuffer(blob);
      } catch (e) {
        console.error('SourceBuffer append error:', e);
      }
    } else {
      this.queue.push(blob);
    }
  }
}
