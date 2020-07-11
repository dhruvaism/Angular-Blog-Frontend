import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { JwtService } from './jwt.service';
import { User, UserResponse } from './../models/user-model';
import { environment } from './../../environments/environment';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  jwtToken:JwtToken;
  user:User = null;
  user$ = new BehaviorSubject<User>(this.user);
  location:string;
  creatUser$ = new BehaviorSubject<any>(null);
  SERVER_URL = environment.SERVER_URL;
  months:string[] = ['Jan','Feb','March','April','may','June','July','Aug','Sept','Oct','Nov','Dec'];

  constructor(private http: HttpClient,
              private jwt: JwtService) {

    this.getUserByJwt();
   
  }

  getUserByJwt(){
    this.jwt.jwtToken$.subscribe((token:JwtToken)=> {
      if(token) {
        this.jwtToken = token;
        console.log(this.jwtToken);
        console.log(this.jwtToken.id);
        this.getUserById(this.jwtToken.id)
        .subscribe((userResponse:UserResponse)=> {
             console.log(userResponse);
             if(userResponse && userResponse.success) {
               this.user = userResponse.result;
               this.user.created_at = this.formatter(this.user.created_at.slice(0,10));
               this.user.dob = this.formatter(this.user.dob);
               this.user$.next(this.user);
             }
        });
      }else{
        this.user$.next(null);
      }
});     
  }
  formatter(date:string){
    var mm = date.slice(5,7);
    var yy = date.slice(0,4);
    var dd = date.slice(8,10);
    mm = this.months[parseInt(mm)-1];
    if(parseInt(dd)==1) {
      dd = parseInt(dd)+"st";
    }else if(parseInt(dd)==2){
      dd = parseInt(dd)+"nd"
    }else if(parseInt(dd)==3){
      dd = parseInt(dd)+"rd"
    }else{
      dd = parseInt(dd)+"th"
    }
    
    return (dd +" "+mm+ " "+yy);
    
}


  createUser(data:any,locationn:string): Observable<any> {
            return this.http.post<any>(`${this.SERVER_URL}/auth/register`,{
              password:data.password,
              email:data.email,
              fname:data.fname,
              lname:data.lname,
              dob:data.dob,
              location:locationn
            });        
   
  }

  attemptSignIn(data:any):Observable<any> {
    return this.http.post<any>(`${this.SERVER_URL}/auth/login`,{
      email:data.email,
      password:data.password
    });
  }

  getUserById(id:number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.SERVER_URL}/user/${id}`);
  }

  uploadProfile(file:File):Observable<any> {
    let fd = new FormData();
    fd.append('user_image',file,file.name);
    fd.append('userId',`${this.user.id}`);
    return this.http.post<any>(`${this.SERVER_URL}/user/upload-profile`,fd,{
      reportProgress:true,
      observe: 'events'
    });
  }

  uploadImage(file:File):Observable<any> {
    let fd = new FormData();
    fd.append('image',file,file.name);
    return this.http.post<any>(`${this.SERVER_URL}/user/upload-image`,fd,{
      reportProgress:true,
      observe: 'events'
    });
  }


}

export interface JwtToken {
  id:number,
  token:string
}