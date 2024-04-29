import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatchedDetailsComponent } from './matched-details.component';

const routes: Routes = [{ path: '', component: MatchedDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MatchedDetailsRoutingModule { }
