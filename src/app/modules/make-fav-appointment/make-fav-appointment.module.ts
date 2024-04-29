import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MakeFavAppointmentRoutingModule } from './make-fav-appointment-routing.module';
import { MakeFavAppointmentComponent } from './make-fav-appointment.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';


@NgModule({
  declarations: [
    MakeFavAppointmentComponent
  ],
  imports: [
    CommonModule,
    MakeFavAppointmentRoutingModule,

    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatNativeDateModule,
  ]
})
export class MakeFavAppointmentModule { }
