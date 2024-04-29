import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdateAppointmentComponent } from './update-appointment.component';


const routes: Routes = [{ path: '', component: UpdateAppointmentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpdateAppointmentRoutingModule { }
