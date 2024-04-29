import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminCdetailsRoutingModule } from './admin-cdetails-routing.module';
import { AdminCdetailsComponent } from './admin-cdetails.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';


@NgModule({
  declarations: [
    AdminCdetailsComponent
  ],
  imports: [
    CommonModule,
    AdminCdetailsRoutingModule,

    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatOptionModule,
  ]
})
export class AdminCdetailsModule { }
