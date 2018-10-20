import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';

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


  private libraryFind(queryString: string): any {
    const searchPatt = new RegExp(queryString, 'gi');
    const searchKeys = [
      'title',
      'artist',
      'album'
    ];

    return this.library.filter((song: any) => {
      for (const key of searchKeys) {
        if (song.hasOwnProperty(key) && searchPatt.test(song[key])) {
          return true;
          break;
        } else {
          return false;
        }
      }
    });
  }


  public search(queryString: string): Observable<any> {
    const searchObservable = new Observable((observer: Subscriber<any>) => {
      // next:
    });

    return searchObservable;
  }
}
