import { BookService } from './../services/book.service';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, mergeMap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css'],
})
export class BooksComponent implements OnInit {
  isLoggedIn: boolean = false;
  books: any;
  currentUser: any;
  isAdmin: boolean = false;
  role: string = 'user';
  borrowedBooks: string[] = [];
  username: string = '';

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private router: Router
  ) {}

  //getBooks method ----------------------------callback hell here - to resolve this
  // getBooks(headers: HttpHeaders) {
  //   this.bookService.books(headers).subscribe({
  //     next: (data) => {
  //       for (const book of data) {
  //         this.getAverageRating(book._id).subscribe((rating) => {
  //           book.averageRating = rating ? rating : 0;
  //         });
  //         this.books = data;
  //       }
  //     },
  //     error: (err) => {
  //       this.authService.logout();
  //       alert(`${err.error.message} - Please login`);
  //     },
  //   });
  // }

  getBooks(headers: HttpHeaders) {
    this.bookService
      .books(headers)
      .pipe(
        mergeMap((data) => {
          const ratingRequests = data.map((book: any) => {
            return this.getAverageRating(book._id).pipe(
              map((rating) => {
                book.averageRating = rating ? rating : 0;
                return book;
              })
            );
          });
          return forkJoin(ratingRequests);
        })
      )
      .subscribe({
        next: (books) => {
          this.books = books;
        },
        error: (err) => {
          this.authService.logout();
          alert(`${err.error.message} - Please login`);
        },
      });
  }

  //ngOnInit -----------------------------------------------

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.role = localStorage.getItem('role') as any;
    this.isAdmin = this.authService.isAdmin();
    this.username = localStorage.getItem('username')!;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      const headers = new HttpHeaders({
        'x-access-token': localStorage.getItem('token') as any,
      });

      this.currentUser = localStorage.getItem('userId');

      this.authService.getUser(this.currentUser, headers).subscribe({
        next: (data) => {
          this.borrowedBooks = data.borrowedBooks;
        },
        error: (err) => {
          this.authService.logout();
          alert(`${err.error.message} - Please login`);
        },
      });

      this.getBooks(headers);
    }
  }

  //deleteBook method  --------------------------------------

  deleteBook(id: string) {
    const headers = new HttpHeaders({
      'x-access-token': localStorage.getItem('token') as any,
    });
    this.bookService.deleteBook(id, headers).subscribe({
      next: (res) => {
        window.location.reload();
      },
      error: (err) => {
        this.authService.logout();
        alert(`${err.error.message} - Please login`);
      },
    });
  }

  //borrow book method-----------------------------------------

  borrowBook(id: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token') as any,
    });
    this.bookService.borrowBook(id, headers).subscribe({
      next: (res) => {
        window.location.reload();
      },
      error: (err) => {
        this.authService.logout();
        alert(`${err.error.message} - Please login`);
      },
    });
  }

  //return book method------------------------------------------

  returnBook(id: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token') as any,
    });
    this.bookService.returnBook(id, headers).subscribe({
      next: (res) => {
        window.location.reload();
      },
      error: (err) => {
        this.authService.logout();
        alert(`${err.error.message} - Please login`);
      },
    });
  }

  //review book method-----------------------------------------

  reviewBook(id: string) {
    this.router.navigate([`/books/${id}`]);
  }

  //getAverageRating method ------------------------------------

  getAverageRating(id: string): Observable<number | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token') as any,
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
        this.authService.logout();
        return of(null);
      })
    );
  }
}
