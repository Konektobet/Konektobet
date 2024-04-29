import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoverPreviewRoutingModule } from './cover-preview-routing.module';
import { CoverPreviewComponent } from './cover-preview.component';


@NgModule({
  declarations: [
    CoverPreviewComponent
  ],
  imports: [
    CommonModule,
    CoverPreviewRoutingModule
  ]
})
export class CoverPreviewModule { }
