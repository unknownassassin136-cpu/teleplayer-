import { Server } from 'socket.io';

class MonitoringService {
  constructor() {
    this.io = null;
    this.devices = new Map(); // Store connected devices
    this.admins = new Set(); // Store connected admins
  }

  initialize(server, port = null) {
    if (port && port != process.env.PORT) {
      this.io = new Server(port, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      });
      console.log(`✓ Monitoring Socket.io running on port ${port}`);
    } else {
      this.io = new Server(server, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      });
    }

    this.io.on('connection', (socket) => {
      console.log(`New monitoring connection: ${socket.id}`);

      socket.on('register', (data) => {
        const { type, deviceId, info } = data;
        if (type === 'admin') {
          this.admins.add(socket.id);
          console.log(`Admin registered: ${socket.id}`);
          // Send current device list to admin
          socket.emit('device_list', Array.from(this.devices.values()));
        } else if (type === 'device') {
          const device = {
            id: socket.id,
            deviceId,
            info,
            status: 'online',
            lastSeen: new Date()
          };
          this.devices.set(socket.id, device);
          console.log(`Device registered: ${deviceId} (${socket.id})`);
          this.notifyAdmins('device_connected', device);
        }
      });

      // Relay stream data from device to admins
      socket.on('stream_data', (data) => {
        const { streamType, blob } = data;
        // console.log(`Received ${streamType} stream from ${socket.id}`);
        this.relayToAdmins('stream_data', {
          deviceId: socket.id,
          streamType,
          blob
        });
      });

      socket.on('disconnect', () => {
        if (this.admins.has(socket.id)) {
          this.admins.delete(socket.id);
          console.log(`Admin disconnected: ${socket.id}`);
        } else if (this.devices.has(socket.id)) {
          const device = this.devices.get(socket.id);
          console.log(`Device disconnected: ${device.deviceId}`);
          this.devices.delete(socket.id);
          this.notifyAdmins('device_disconnected', { id: socket.id, deviceId: device.deviceId });
        }
      });
    });
  }

  notifyAdmins(event, data) {
    for (const adminId of this.admins) {
      this.io.to(adminId).emit(event, data);
    }
  }

  relayToAdmins(event, data) {
    for (const adminId of this.admins) {
      this.io.to(adminId).emit(event, data);
    }
  }

  getConnectedDevices() {
    return Array.from(this.devices.values());
  }
}

export const monitoringService = new MonitoringService();
