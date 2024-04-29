import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicLoginComponent } from './clinic-login.component';

const routes: Routes = [{ path: '', component: ClinicLoginComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicLoginRoutingModule { }
