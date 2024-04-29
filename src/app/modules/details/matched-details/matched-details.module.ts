import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatchedDetailsRoutingModule } from './matched-details-routing.module';
import { MatchedDetailsComponent } from './matched-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [
    MatchedDetailsComponent
  ],
  imports: [
    CommonModule,
    MatchedDetailsRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ]
})
export class MatchedDetailsModule { }
