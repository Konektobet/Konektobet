import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubsConfirmationRoutingModule } from './subs-confirmation-routing.module';
import { SubsConfirmationComponent } from './subs-confirmation.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    SubsConfirmationComponent
  ],
  imports: [
    CommonModule,
    SubsConfirmationRoutingModule,

    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ]
})
export class SubsConfirmationModule { }
