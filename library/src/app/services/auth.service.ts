import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private serverUrl='http://127.0.0.1:4001';

  constructor(private http: HttpClient) {}

  login(username:string, password:string):Observable<any> {
    return this.http.post(this.serverUrl + '/login',{username,password});
  }

  getUser(id:string,headers:HttpHeaders):Observable<any> {
    return this.http.get(this.serverUrl + `/users/${id}`,{headers});
  }

  register(username:string,email:string, password:string):Observable<any> {
    return this.http.post(this.serverUrl + '/register',{username,email,password});
  }

  isLoggedIn(){
    return !!localStorage.getItem('token');
  }


  logout(){
    localStorage.removeItem('currentUser');
  }

}
