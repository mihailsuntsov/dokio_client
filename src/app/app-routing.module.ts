import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) }, 
  { path: 'contacts', loadChildren: () => import('./pages/contacts/contacts.module').then(m => m.ContactsModule) },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
