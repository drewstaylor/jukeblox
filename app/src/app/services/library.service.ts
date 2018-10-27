import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  public library: Array<any>;

  constructor(private http: HttpClient) {
    this.fetchLibrary();
  }


  private fetchLibrary(): void {
    this.http.get('assets/json/library.json', { responseType: 'json' })
      .toPromise()
      .then((library: string) => {
        this.library = Array.from(library);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }


  private libraryFilter(queryString: string): Array<any> {
    if (!queryString) {
      return [];
    } else {
      const searchKeys = ['title', 'artist', 'album'];
      return this.library.filter((song: any) => {
        for (const key of searchKeys) {
          if (
            song.hasOwnProperty(key) && 
            song[key].toLowerCase().includes(queryString.toLowerCase())
          ) {
            return true;
          }
        }
        return false;
      });
    }
  }


  public search(queryString: string): Observable<any> {
    // console.log(typeof queryString, queryString);
    return new Observable((observer: Subscriber<any>) => {
      observer.next(this.libraryFilter(queryString));
    });
  }
}
