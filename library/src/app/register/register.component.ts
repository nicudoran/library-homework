import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm:FormGroup=new FormGroup({});
  error:string="";
  submitted:boolean=false;
  loading=false;

  constructor(
    private router: Router, 
    private formBuilder: FormBuilder, 
    private authService:AuthService) {}
 
  get formValues(){
    return this.registerForm.controls;
  }

  ngOnInit(): void {
    this.registerForm=this.formBuilder.group({
      username:['',Validators.required],
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(6)]],
    });
}
onSubmit(){
  this.submitted=true;

  if (this.registerForm.invalid){
    return;
  }
  this.loading=true;
  this.authService.register(
    this.formValues['username'].value,
    this.formValues['email'].value,
    this.formValues['password'].value
    ).subscribe({
      next:(data)=>{
        this.router.navigate(['/login']);
      },
      error:(error)=>{
        alert(error.error.message);
        this.error=error.message;
        this.loading=false;
      }
    });
}

}
