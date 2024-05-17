import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrialRoutingModule } from './trial-routing.module';
import { TrialComponent } from './trial.component';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    TrialComponent
  ],
  imports: [
    CommonModule,
    TrialRoutingModule,
    // MatCardModule,
    // MatIconModule,
    // MatButtonModule,
    // MatDividerModule,
    // MatInputModule,
    // MatAutocompleteModule,
    // MatChipsModule,
    // FormsModule,
    // ReactiveFormsModule,
    // MatSelectModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatOptionModule,
    FormsModule,
    MatFormFieldModule,
  ]
})
export class TrialModule { }
