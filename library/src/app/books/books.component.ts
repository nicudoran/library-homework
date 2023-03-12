import { BookService } from './../services/book.service';
import { Component, OnInit,Input} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpHeaders,HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit {
  isLoggedIn:boolean = false;
  books:any;
  currentUser:any;
  isAdmin:boolean = false;
  role:string = 'user';
  borrowedBooks:string[]=[];


  constructor(
    private http:HttpClient,
    private authService:AuthService,
    private bookService:BookService,
    private router:Router,
    ){}

    ngOnInit(): void {

      this.isLoggedIn=this.authService.isLoggedIn();
      this.role=localStorage.getItem('role') as any;
      this.isAdmin=this.role==='admin'?true:false;

      if(!(this.isLoggedIn)){
        this.router.navigate(['/login']);
      }
      else{
          const headers=new HttpHeaders({
          "x-access-token":localStorage.getItem('token') as any})
          this.currentUser=localStorage.getItem('userId');
          this.authService.getUser(this.currentUser,headers).subscribe(
            (data)=>{
              this.borrowedBooks=data.borrowedBooks;
            })
          this.bookService.books(headers).subscribe(
            (data)=>{
              for (const book of data) {
                this.getAverageRating(book._id).subscribe(rating => {
                  book.averageRating=rating? rating : 0;
              })
              this.books=data;
            }
          }
            );
        }
      }
      deleteBook(id:string){
  const headers=new HttpHeaders({
    "x-access-token":localStorage.getItem('token') as any})
    this.bookService.deleteBook(id,headers).subscribe({
      next:(res)=>{window.location.reload();
      },error:(err)=>{alert(err.error.message);
      }});
}

borrowBook(id:string){
  const headers=new HttpHeaders({
    'Content-Type':'application/json',
    "x-access-token":localStorage.getItem('token') as any})
    this.bookService.borrowBook(id,headers).subscribe({
      next:(res)=>{window.location.reload();
      },error:(err)=>{alert(err.error.message);
      }});
}

returnBook(id:string){
const headers=new HttpHeaders({
  'Content-Type':'application/json',
  "x-access-token":localStorage.getItem('token') as any})
  this.bookService.returnBook(id,headers).subscribe({
    next:(res)=>{window.location.reload();
    },error:(err)=>{alert(err.error.message);
    }});
  }

reviewBook(id:string){
  this.router.navigate([`/books/${id}`]);
  }

  getAverageRating(id: string): Observable<number|null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      "x-access-token": localStorage.getItem('token') as any
    });
    return this.bookService.getAverageRating(id, headers).pipe(
      map((res) => {
        if (res) {
          return res.avg;
        } else {
          return null;
        }
      }),
      catchError((err) => {
        alert(err.error);
        return of(null);
      })
    );
  }
}
