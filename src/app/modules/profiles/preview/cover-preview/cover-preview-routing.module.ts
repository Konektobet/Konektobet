import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoverPreviewComponent } from './cover-preview.component';

const routes: Routes = [{ path: '', component: CoverPreviewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoverPreviewRoutingModule { }
