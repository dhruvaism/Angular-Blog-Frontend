import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { from } from 'rxjs';


const routes: Routes = [

  {
    path:'',
    component: HomeComponent
  },
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
