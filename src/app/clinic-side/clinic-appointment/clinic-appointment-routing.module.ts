import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicAppointmentComponent } from './clinic-appointment.component';

const routes: Routes = [{ path: '', component: ClinicAppointmentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicAppointmentRoutingModule { }
