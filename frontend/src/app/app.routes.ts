import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PlayerComponent } from './pages/player/player.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { MonitorDashboardComponent } from './components/monitor-dashboard/monitor-dashboard.component';
import { MonitoredDeviceComponent } from './components/monitored-device/monitored-device.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'watch/:id', component: PlayerComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/monitor', component: MonitorDashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: 'monitor', component: MonitoredDeviceComponent },
  { path: '**', redirectTo: '' }
];
