import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log(res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('userId', res._id);
        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        let returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        this.router.navigate([returnUrl || '/']);
      },
      error: (error) => {
        alert(error.error.message);
      },
    });
  }
  name = localStorage.getItem('username');

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}
