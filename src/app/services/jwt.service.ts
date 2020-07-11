import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  //Observable to inform if there is a user 
  token:JwtToken; 
  jwtToken$ = new BehaviorSubject<JwtToken>(null);  

  constructor() {
      this.getToken();
   }

  saveToken(token:JwtToken){
      localStorage.setItem('jwtToken',JSON.stringify(token));
      this.token = JSON.parse(localStorage.getItem('jwtToken'));
      this.jwtToken$.next(this.token);
    
    }

  getToken() {
      this.token = JSON.parse(localStorage.getItem('jwtToken'));
      console.log("token: "+this.token);
      this.jwtToken$.next(this.token);
  }

  destroyToken() {
      localStorage.removeItem('jwtToken');
      this.jwtToken$.next(null);
  }


}

export interface JwtToken {
         id:number,
         token:string
}
