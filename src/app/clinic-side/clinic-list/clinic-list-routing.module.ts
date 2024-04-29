import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicListComponent } from './clinic-list.component';

const routes: Routes = [{ path: '', component: ClinicListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicListRoutingModule { }
