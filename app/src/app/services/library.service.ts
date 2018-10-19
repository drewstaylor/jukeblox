import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  public library: JSON;

  constructor(private http: HttpClient) {
    this.fetchLibrary();
  }


  private fetchLibrary(): void {
    this.http.get('assets/json/library.json')
      .toPromise()
      .then((library: JSON) => {
        // console.log('Fetched library!:', library);
        this.library = library;
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }
}
