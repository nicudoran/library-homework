import { HttpHeaders } from '@angular/common/http';
import { BookService } from './../services/book.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reviews-page',
  templateUrl: './reviews-page.component.html',
  styleUrls: ['./reviews-page.component.css'],
})
export class ReviewsPageComponent implements OnInit {
  bookId = '';
  book: any;
  isLoggedIn = false;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.bookId = params['id'];
    });

    this.isLoggedIn = this.authService.isLoggedIn();

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('token') as any,
      });

      this.bookService.getBook(this.bookId, headers).subscribe((data) => {
        this.book = data;
        if (this.book) {
          this.bookService.getAverageRating(this.bookId, headers).subscribe({
            next: (data) => {
              console.log(data);
              this.book.average_rating = data.avg;
            },
            error: (error) => {
              console.log(error.error.message);
            },
          });
        }
      });
    }
  }
}
