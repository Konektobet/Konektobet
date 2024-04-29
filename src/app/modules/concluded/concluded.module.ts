import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConcludedRoutingModule } from './concluded-routing.module';
import { ConcludedComponent } from './concluded.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ConcludedComponent
  ],
  imports: [
    CommonModule,
    ConcludedRoutingModule,

    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule
  ]
})
export class ConcludedModule { }

