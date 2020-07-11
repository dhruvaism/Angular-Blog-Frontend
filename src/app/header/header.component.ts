import { Component, OnInit } from '@angular/core';
import { User, UserResponse } from './../models/user-model';
import { UserService } from './../services/user.service';
import { logging } from 'protractor';
import { JwtService } from '../services/jwt.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user:User;
  constructor(private userService:UserService,
              private router:Router,
              private jwtService:JwtService) {
   
   }

  ngOnInit(): void {
    this.userService.user$.subscribe((user:User)=> {
      if(user) {
        this.user = user;
      }else{
        this.user = null;
      }
    }); 
   }

  goToProfile() {
    this.router.navigate(['user/my-profile']).then();

  }
  logOut(){
    
      this.jwtService.destroyToken();
      this.router.navigate(['']).then();
      
    
  }

}
