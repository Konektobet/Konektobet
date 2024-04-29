import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RatingsRoutingModule } from './ratings-routing.module';
import { RatingsComponent } from './ratings.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [
    RatingsComponent
  ],
  imports: [
    CommonModule,
    RatingsRoutingModule,

    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatDividerModule,
    MatInputModule,
    MatInputModule,
  ]
})
export class RatingsModule { }
