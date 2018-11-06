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
      // Search these three fields
      const searchKeys = ['title', 'artist', 'album'];
      var result = this.library.filter((song: any) => {
        // Try each field if available
        for (const key of searchKeys) {
          if (song.hasOwnProperty(key)) {
            const needle = queryString.toLowerCase();
            // Factor out punctuation
            const haystack = song[key].replace(/([^\w\s]|_)/gi, '').toLowerCase();
            
            if (haystack.includes(needle)) {
              return true;
            }
          }
        }
        return false;
      });

      console.log(result);
      return result;
    }
  }


  public search(queryString: string): Observable<any> {
    // console.log(typeof queryString, queryString);
    return new Observable((observer: Subscriber<any>) => {
      observer.next(this.libraryFilter(queryString));
    });
  }
}
