import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FindDetailsComponent } from './find-details.component';

const routes: Routes = [{ path: '', component: FindDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FindDetailsRoutingModule { }
