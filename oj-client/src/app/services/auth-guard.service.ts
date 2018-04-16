import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate} from '@angular/router'

@Injectable()
export class AuthGuardService implements CanActivate {


  constructor( @Inject('auth') private auth, private router: Router) { }
  //import  global  and locally
  canActivate(): boolean {
    if (this.auth.authenticated()) {
      return true;
    } else {
      // redirect to home page if not logged in
      // that is, if not logged in, return to the Problem page
      this.router.navigate(['/problems']);
      // return false;
      return true;
    }
  }

  isAdmin(): boolean { // Only admin can get access to the newProblem page
    if (this.auth.authenticated() && this.auth.getProfile().roles.includes('Admin')) {
      return true;
    } else
      // return false;
      return true;

  }
}
