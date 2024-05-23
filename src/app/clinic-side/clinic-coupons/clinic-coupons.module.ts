import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicCouponsRoutingModule } from './clinic-coupons-routing.module';
import { ClinicCouponsComponent } from './clinic-coupons.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    ClinicCouponsComponent
  ],
  imports: [
    CommonModule,
    ClinicCouponsRoutingModule,

    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
  ]
})
export class ClinicCouponsModule { }
