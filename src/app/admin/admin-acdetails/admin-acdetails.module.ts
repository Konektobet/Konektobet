import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminAcdetailsRoutingModule } from './admin-acdetails-routing.module';
import { AdminAcdetailsComponent } from './admin-acdetails.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AdminAcdetailsComponent
  ],
  imports: [
    CommonModule,
    AdminAcdetailsRoutingModule,

    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
  ]
})
export class AdminAcdetailsModule { }
