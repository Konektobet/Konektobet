import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicAppointmentRoutingModule } from './clinic-appointment-routing.module';
import { ClinicAppointmentComponent } from './clinic-appointment.component';


@NgModule({
  declarations: [
    ClinicAppointmentComponent
  ],
  imports: [
    CommonModule,
    ClinicAppointmentRoutingModule
  ]
})
export class ClinicAppointmentModule { }
