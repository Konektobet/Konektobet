import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfilePreviewRoutingModule } from './profile-preview-routing.module';
import { ProfilePreviewComponent } from './profile-preview.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    ProfilePreviewComponent
  ],
  imports: [
    CommonModule,
    ProfilePreviewRoutingModule,

    MatButtonModule,
    MatIconModule,
  ]
})
export class ProfilePreviewModule { }
