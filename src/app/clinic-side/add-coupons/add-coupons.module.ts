import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddCouponsRoutingModule } from './add-coupons-routing.module';
import { AddCouponsComponent } from './add-coupons.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    AddCouponsComponent
  ],
  imports: [
    CommonModule,
    AddCouponsRoutingModule,
    
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class AddCouponsModule { }
