import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import Gun from 'gun';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  public library: Array<any>;
  private gun: any;

  constructor(private http: HttpClient) {
    // XXX; replace this later with server / node URL
    const gunPeers = ['https://jukeblox-gun.herokuapp.com/gun'];
    this.gun = Gun(gunPeers);
    window['gun'] = this.gun;

    this.fetchLibrary();
  }


  private fetchLibrary(): void {
    this.http.get('assets/json/library.json', { responseType: 'json' })
      .toPromise()
      .then((library: string) => {
        this.library = Array.from(library);
        // this.gunMigrate(this.library);

      })
      .catch((error: Error) => {
        console.error(error);
      });
  }


  private gunMigrate(library: Array<any>): void {
    const songs = this.gun.get('songs');

    library.forEach(song => {
      const title = song.title || null;
      const artist = song.artist || null;
      const album = song.album || null;
      const trackNumber = song.trackNumber || null;
      const index = song.index;
      const tags = song.tags;

      // Create the gun entry for the song
      const songRef = this.gun.get(song.index);
      const tagRef = songRef.get('tags');

      songRef.get('title').put(title);
      songRef.get('artist').put(artist);
      songRef.get('album').put(album);
      songRef.get('trackNumber').put(trackNumber);
      songRef.get('index').put(index);

      // Convert tag array to object (Gun doesn't accept arrays);
      tags.forEach(tag => {
        tagRef.set(tag);
      });

      songs.set(songRef);
    });
  }


  private libraryFilter(queryString: string): Array<any> {
    if (!queryString) {
      return [];
    } else {
      // Search these three fields
      const searchKeys = ['title', 'artist', 'album'];
      const result = this.library.filter((song: any) => {
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
