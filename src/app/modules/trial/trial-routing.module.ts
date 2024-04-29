import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrialComponent } from './trial.component';

const routes: Routes = [{ path: '', component: TrialComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrialRoutingModule { }
