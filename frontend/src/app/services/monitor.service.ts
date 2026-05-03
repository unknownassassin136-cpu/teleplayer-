import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private socket: Socket;
  private deviceListSubject = new Subject<any[]>();
  private streamDataSubject = new Subject<any>();
  private apiUrl = 'https://teleplayer.onrender.com'; // Base URL
  private monitorPort = '6001'; // Default or from config
  private mediaRecorder?: MediaRecorder;

  constructor(private authService: AuthService) {
    // Determine backend URL dynamically
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // e.g. localhost:4200 or teleplayer.onrender.com
    
    // If we are on localhost, backend is usually on :3000
    // If we are in production, backend is the same host or a specific API URL
    let socketUrl = '';
    if (window.location.hostname === 'localhost') {
      socketUrl = `http://localhost:3000`;
    } else {
      socketUrl = window.location.origin; // Assume backend and frontend share origin (e.g. Vercel + Render setup)
      // Or if they are separate:
      socketUrl = 'https://teleplayer.onrender.com';
    }

    console.log('Connecting to monitor socket at:', socketUrl);
    this.socket = io(socketUrl);
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('device_list', (devices: any[]) => {
      this.deviceListSubject.next(devices);
    });

    this.socket.on('device_connected', (device: any) => {
      // Refresh list or handle single device
      this.socket.emit('get_device_list'); 
    });

    this.socket.on('stream_data', (data: any) => {
      this.streamDataSubject.next(data);
    });
  }

  registerAdmin() {
    this.socket.emit('register', {
      type: 'admin',
      token: this.authService.getToken()
    });
  }

  registerDevice() {
    this.socket.emit('register', {
      type: 'device',
      deviceId: this.generateDeviceId(),
      info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    });
  }

  getDeviceList(): Observable<any[]> {
    return this.deviceListSubject.asObservable();
  }

  getStreamData(): Observable<any> {
    return this.streamDataSubject.asObservable();
  }

  async startStreaming() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          // Convert Blob to ArrayBuffer/Base64 to send via socket
          const reader = new FileReader();
          reader.onload = () => {
            this.socket.emit('stream_data', {
              streamType: 'video',
              blob: reader.result
            });
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Send chunks every second
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  stopStreaming() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
  }

  private generateDeviceId(): string {
    let id = localStorage.getItem('monitor_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('monitor_device_id', id);
    }
    return id;
  }
}
