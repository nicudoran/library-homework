import { BooksComponent } from './books/books.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { NewBookComponent } from './new-book/new-book.component';
import { ReviewComponent } from './review/review.component';

const routes: Routes = [
  {path:'register',component:RegisterComponent},
  {path:'login',component:LoginComponent},
  {path:'books',component:BooksComponent},
  {path:'books/:id',component:ReviewComponent},
  {path:'add-book',component:NewBookComponent},
  {path:'',redirectTo:'register', pathMatch:'full'},
  {path:'**',component:PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
