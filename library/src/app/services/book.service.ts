import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private serverUrl = 'http://127.0.0.1:4001';

  constructor(private http: HttpClient) {}

  addBook(
    title: string,
    author: string,
    description: string,
    img_link: string,
    headers: HttpHeaders
  ): Observable<any> {
    return this.http.post(
      this.serverUrl + '/add-book',
      { title, author, description, img_link },
      { headers }
    );
  }

  books(headers: HttpHeaders): Observable<any> {
    return this.http.get(this.serverUrl + '/books', { headers });
  }

  getBook(id: any, headers: HttpHeaders): Observable<any> {
    return this.http.get(this.serverUrl + `/book/${id}`, { headers });
  }

  deleteBook(id: string, headers: HttpHeaders): Observable<any> {
    if (confirm('Are you sure you want to delete this book?')) {
      return this.http.delete(this.serverUrl + `/books/${id}`, { headers });
    }
    return of();
  }

  borrowBook(id: string, headers: HttpHeaders): Observable<any> {
    console.log(headers);
    return this.http.post(this.serverUrl + `/transaction`, { id }, { headers });
  }

  returnBook(id: string, headers: HttpHeaders): Observable<any> {
    console.log(headers);
    return this.http.post(
      this.serverUrl + `/return`,
      { book_id: id },
      { headers }
    );
  }

  review(
    id: string,
    rating: Number,
    review_author: string,
    review: string,
    headers: HttpHeaders
  ): Observable<any> {
    return this.http.post(
      this.serverUrl + `/review`,
      { book_id: id, rating, review_author, review },
      { headers }
    );
  }

  getAverageRating(id: string, headers: HttpHeaders): Observable<any> {
    return this.http.get(this.serverUrl + `/average/${id}`, { headers });
  }
}
