import { BooksComponent } from './books/books.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { NewBookComponent } from './new-book/new-book.component';
import { ReviewComponent } from './review/review.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './services/auth-guard.service';
import { HomeComponent } from './home/home.component';
import { NoAccessComponent } from './no-access/no-access.component';
import { AdminAuthGuard } from './services/admin-auth-guard.service';
import { ReviewsPageComponent } from './reviews-page/reviews-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'books', component: BooksComponent },
  { path: 'books/:id', component: ReviewComponent },
  { path: 'books/reviews/:id', component: ReviewsPageComponent },
  { path: 'add-book', component: NewBookComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminAuthGuard],
  },
  { path: 'no-access', component: NoAccessComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
