import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { from } from 'rxjs';
import { UserService } from './../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtService } from 'src/app/services/jwt.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form: FormGroup;
  response: createUserResponse;

  constructor(private fb:FormBuilder,
              private userService:UserService,
              private router: Router,
              private jwt: JwtService,
              private http:HttpClient) {

                this.form = this.fb.group({
                  fname: ['',Validators.required],
                  lname: ['',Validators.required],
                  email: ['',[Validators.required,Validators.email]],
                  dob: ['',[Validators.required]],
                  password: ['',[Validators.required,Validators.minLength(6)]]
                });

               }

  ngOnInit(): void {
  }

  onSubmit() {
      this.http.get('http://ip-api.com/json/').subscribe((res:any)=>{
        if(res && res.status === 'success') {
           this.userService.createUser(this.form.value,res.city+","+res.regionName
           ).subscribe(response => {
            this.response = response;
            console.log(response);
            if(this.response !==null && this.response.success) {
                 this.router.navigateByUrl('user/login').then();
            }
      });
        }
      })
    
    
  
    }

}

 interface createUserResponse {
  success:number,
  errors:string,
  message: string
}
