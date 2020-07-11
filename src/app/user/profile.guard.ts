import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtService, JwtToken } from '../services/jwt.service';
import { UserService } from '../services/user.service';
import { User } from './../models/user-model';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {

  jwtToken:JwtToken;
  constructor(private jwtService: JwtService,
              private router: Router) {
                  this.jwtService.jwtToken$.subscribe(token => this.jwtToken = token);
              }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.jwtToken) {
      return true;
    }
    this.router.navigate(['user/login']).then();
    return false;
  }
  
}
