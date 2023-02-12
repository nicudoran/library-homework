import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
constructor(
  private authService: AuthService,
  private router: Router
){}

isLoggedIn(){
  return this.authService.isLoggedIn();
}

logout(){
  localStorage.clear();
  this.router.navigate(['/login']);
  window.location.reload();
}
}
