import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CouponsRoutingModule } from './coupons-routing.module';
import { CouponsComponent } from './coupons.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    CouponsComponent
  ],
  imports: [
    CommonModule,
    CouponsRoutingModule,

    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ]
})
export class CouponsModule { }
