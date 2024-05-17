import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicDetailsComponent } from './clinic-details.component';

const routes: Routes = [{ path: '', component: ClinicDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicDetailsRoutingModule { }
