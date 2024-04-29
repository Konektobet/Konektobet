import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MakeFavAppointmentComponent } from './make-fav-appointment.component';

const routes: Routes = [{ path: '', component: MakeFavAppointmentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MakeFavAppointmentRoutingModule { }
