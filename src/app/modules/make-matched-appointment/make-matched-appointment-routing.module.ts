import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MakeMatchedAppointmentComponent } from './make-matched-appointment.component';

const routes: Routes = [{ path: '', component: MakeMatchedAppointmentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MakeMatchedAppointmentRoutingModule { }
