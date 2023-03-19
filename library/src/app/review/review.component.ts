import { BookService } from './../services/book.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
})
export class ReviewComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  rating!: Number;
  review: string = '';
  isLoggedIn: boolean = false;
  book: any;
  bookId!: string;
  review_author = localStorage.getItem('username')!;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.bookId = params['id'];
    });

    this.isLoggedIn = this.authService.isLoggedIn();

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      const headers = new HttpHeaders({
        'x-access-token': localStorage.getItem('token') as any,
      });

      this.bookService.getBook(this.bookId, headers).subscribe((data) => {
        this.book = data;
      });
    }
  }

  onSubmit() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-access-token': localStorage.getItem('token') as any,
    });
    this.bookService
      .review(
        this.bookId,
        this.rating,
        this.review_author,
        this.review,
        headers
      )
      .subscribe({
        next: (res) => {
          this.router.navigate(['/books']);
        },
        error: (err) => {
          alert(err.error.message);
        },
      });
  }
}
