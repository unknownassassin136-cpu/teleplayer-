import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private socket: Socket;
  private deviceListSubject = new Subject<any[]>();
  private streamDataSubject = new Subject<any>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private apiUrl = 'https://teleplayer.onrender.com'; // Base URL
  private monitorPort = '6001'; // Default or from config
  private mediaRecorder?: MediaRecorder;
  private videoInterval: any;
  private localStream?: MediaStream;

  constructor(private authService: AuthService) {
    // Determine backend URL dynamically
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // e.g. localhost:4200 or teleplayer.onrender.com
    
    // If we are on localhost, backend is usually on :3000
    // If we are in production, backend is the same host or a specific API URL
    // FORCING RENDER BACKEND for local testing as requested
    let socketUrl = 'https://teleplayer.onrender.com';
    
    /* 
    if (window.location.hostname === 'localhost') {
      socketUrl = `http://localhost:3000`;
    } else {
      socketUrl = 'https://teleplayer.onrender.com';
    }
    */

    console.log('Connecting to monitor socket at:', socketUrl);
    this.socket = io(socketUrl);
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to monitor server');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from monitor server');
      this.connectionStatusSubject.next(false);
    });

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

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  async startStreaming() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } }, // Optimize for socket transmission
        audio: true
      });

      // 1. Setup Canvas for Video Frames
      const videoElement = document.createElement('video');
      videoElement.srcObject = this.localStream;
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.play();

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      this.videoInterval = setInterval(() => {
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const base64Data = canvas.toDataURL('image/jpeg', 0.5); // 50% quality JPEG

          this.socket.emit('stream_data', {
            streamType: 'video_frame',
            blob: base64Data
          });
        }
      }, 200); // 5 FPS

      // 2. Setup Audio Recording
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        const audioStream = new MediaStream([audioTrack]);
        this.mediaRecorder = new MediaRecorder(audioStream);
        
        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            const reader = new FileReader();
            reader.onload = () => {
              this.socket.emit('stream_data', {
                streamType: 'audio',
                blob: reader.result
              });
            };
            reader.readAsArrayBuffer(event.data);
          }
        };
        this.mediaRecorder.start(1000);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  stopStreaming() {
    if (this.videoInterval) {
      clearInterval(this.videoInterval);
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
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
