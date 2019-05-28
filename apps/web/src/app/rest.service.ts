import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Run } from './runs/runs.component';
import { VendorCount } from './topten/topten.component';
import { Stats } from './stats/stats.component';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private apiUrl = `http://${environment.API_HOST}:${environment.API_PORT}${environment.API_BASE_HREF}`;

  constructor(private http: HttpClient) {
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  public getStats() {
    return this.http.get<Stats>(`${this.apiUrl}/stats`, { observe: 'response' })
      .pipe(
        catchError(this.handleError)
      );
  }

  public getTopTen() {
    return this.http.get<VendorCount[]>(`${this.apiUrl}/topten`, { observe: 'response' })
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  public getAllRuns(): Observable<HttpResponse<Run[]>> {
    return this.http.get<Run[]>(`${this.apiUrl}/runs`, { observe: 'response' })
      .pipe(
        catchError(this.handleError)
      );
  }
}
