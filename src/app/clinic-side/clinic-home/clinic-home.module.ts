import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicHomeRoutingModule } from './clinic-home-routing.module';
import { ClinicHomeComponent } from './clinic-home.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';


@NgModule({
  declarations: [
    ClinicHomeComponent
  ],
  imports: [
    CommonModule,
    ClinicHomeRoutingModule,

    MatIconModule,
    MatDatepickerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    CanvasJSAngularChartsModule,
  ]
})
export class ClinicHomeModule { }
