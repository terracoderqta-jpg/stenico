import { Routes } from '@angular/router';

import { ClientesComponent } from './pages/clientes/clientes';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { HistorialComponent } from './pages/historial/historial';
import { ChequesComponent } from './pages/cheques/cheques';
import { ConfiguracionComponent } from './pages/configuracion/configuracion';
import { PresupuestosComponent } from './pages/presupuestos/presupuestos';
import { ProductosComponent } from './pages/productos/productos';
import { RevendedoresComponent } from './pages/revendedores/revendedores';
import { VentasComponent } from './pages/ventas/ventas';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: DashboardComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'historial', component: HistorialComponent },
  { path: 'cheques', component: ChequesComponent },
  { path: 'ventas', component: VentasComponent },
  { path: 'revendedores', component: RevendedoresComponent },
  { path: 'presupuestos', component: PresupuestosComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: '**', redirectTo: 'inicio' },
];
 
