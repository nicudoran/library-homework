import { AuthService } from './../services/auth.service';
import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-new-book',
  templateUrl: './new-book.component.html',
  styleUrls: ['./new-book.component.css']
})
export class NewBookComponent {
  title:string='';
  author:string='';
  description:string='';
  
  constructor(
    private authService:AuthService,
    private router:Router,
    private bookService:BookService ) { }

  isLoggedIn(){
    return this.authService.isLoggedIn();
  }

  onSubmit(){
    const headers= new HttpHeaders({
      "Content-Type":"application/json",
    "x-access-token":localStorage.getItem("token") as any,
    })
    this.bookService.addBook(this.title, this.author, this.description, headers).subscribe({
      next:(res)=>{
        this.router.navigate(['/books']);
      },error:(err)=>{
        alert(err.error.message);
      }
    }
    )
  }
}
