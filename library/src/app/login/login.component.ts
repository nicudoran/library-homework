import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
username:string='';
password:string='';
  
  constructor(
    private router: Router, 
    private authService:AuthService) {}
   
  onSubmit(){
    this.authService.login(
      this.username,
      this.password
      ).subscribe({
        next:(res)=>{
          console.log(res);
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('userId', res._id);
          localStorage.setItem('email', res.email);
          localStorage.setItem('role', res.role);
          this.router.navigate(['/books']);
        },
        error:(error)=>{
          alert(error.error.message);}}
        )}
          name=localStorage.getItem('username');

          isLoggedIn(){
            return this.authService.isLoggedIn();
          }
}
