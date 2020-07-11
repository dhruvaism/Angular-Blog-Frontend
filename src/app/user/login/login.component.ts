import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JwtService } from './../../services/jwt.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form:FormGroup;      
  response:SignInResponse;    

  constructor(
              private userService: UserService,
              private fb:FormBuilder,
              private jwt: JwtService,
              private router: Router
              ) { }

  

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['',[Validators.required,Validators.email]],
      password: ['',[Validators.required,Validators.minLength(6)]]
    });

    this.jwt.jwtToken$.subscribe((jwtToken:JwtToken)=> {
      if(jwtToken) {
        console.log("go to profile");
        this.router.navigateByUrl('user/my-profile'); 
      }
    });
  }

  onSubmit() {
    this.userService.attemptSignIn(this.form.value).subscribe(response => {
        this.response = response;  
        if(this.response && this.response.success) {
            this.jwt.saveToken({
              id:this.response.id,
              token:`Bearer ${this.response.token}`
            });
            this.router.navigate(['user/my-profile']).then(); 
            this.form.reset();
        
        }
    });
  }

}

interface SignInResponse {
  success:number,
  error:string,
  id: number,
  token: string
}

export interface JwtToken {
  id:number,
  token:string
}