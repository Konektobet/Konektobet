import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewDetailsRoutingModule } from './new-details-routing.module';
import { NewDetailsComponent } from './new-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [
    NewDetailsComponent
  ],
  imports: [
    CommonModule,
    NewDetailsRoutingModule,

    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
  ]
})
export class NewDetailsModule { }
