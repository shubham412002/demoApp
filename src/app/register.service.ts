import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'http://localhost:3000'
  private userUpdated = new Subject<any>();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  getUsers(id:number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  registerUser(userData): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData);
  }

  updateUser(userData: any,id: number,): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, userData);
  }

  updateUserPhoto(userData: any, id:number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userData.id}`, userData);
  }

  notifyUserUpdated(userData: any) {
    this.userUpdated.next(userData);
  }

  getUserUpdateListener(): Observable<any> {
    return this.userUpdated.asObservable();
  }

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/countries`);
  }

  getStatesByCountryId(countryId: number): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/countries/${countryId}`).pipe(
      map(country => country.states),
      catchError(error => {
        console.error('Error fetching states:', error);
        return of([]);
      })
    );
  }


  // common snackbar
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
