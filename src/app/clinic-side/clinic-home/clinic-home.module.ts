import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicHomeRoutingModule } from './clinic-home-routing.module';
import { ClinicHomeComponent } from './clinic-home.component';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    ClinicHomeComponent
  ],
  imports: [
    CommonModule,
    ClinicHomeRoutingModule,

    MatButtonModule,
  ]
})
export class ClinicHomeModule { }
