import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate() {
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    }
    this.router.navigate(['/no-access']);
    return false;
  }
}
