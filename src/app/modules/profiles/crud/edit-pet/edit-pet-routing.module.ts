import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditPetComponent } from './edit-pet.component';

const routes: Routes = [{ path: '', component: EditPetComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditPetRoutingModule { }
