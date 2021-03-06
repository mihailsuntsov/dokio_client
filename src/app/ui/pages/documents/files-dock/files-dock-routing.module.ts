import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilesDockComponent } from './files-dock.component';

const routes: Routes = [
  { path: '', component: FilesDockComponent },
  { path: ':id', component: FilesDockComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilesDockRoutingModule { }
