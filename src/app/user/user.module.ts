import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'
import { UserRoutingModule } from './user-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
// import { AngularCropperjsModule } from 'angular-cropperjs';



@NgModule({
  declarations: [LoginComponent, RegisterComponent, ProfileComponent,MyProfileComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    // AngularCropperjsModule
    
  ]
})
export class UserModule { }
