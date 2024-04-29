import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PetDetailsComponent } from './pet-details.component';

const routes: Routes = [{ path: '', component: PetDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PetDetailsRoutingModule { }
