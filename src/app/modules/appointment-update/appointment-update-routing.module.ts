import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentUpdateComponent } from './appointment-update.component';

const routes: Routes = [{ path: '', component: AppointmentUpdateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentUpdateRoutingModule { }
