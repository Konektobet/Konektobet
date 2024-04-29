import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicSignupComponent } from './clinic-signup.component';

const routes: Routes = [{ path: '', component: ClinicSignupComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicSignupRoutingModule { }
