import { Injectable } from '@angular/core';
import { ContractsService } from './contracts.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { parse } from 'id3-parser';
import { convertFileToBuffer, fetchFileAsBuffer } from 'id3-parser/lib/universal/helpers';
import universalParse from 'id3-parser/lib/universal';

@Injectable({
  providedIn: 'root'
})
export class MusicService implements OnDestroy {

  private unsubscribe: Subject<void>;

  private _totalRegistered: BehaviorSubject<number>;
  private _currentSong: BehaviorSubject<any>;
  private _songRegistry: BehaviorSubject<Array<any>>;
  private _getSong: BehaviorSubject<Array<any>>;
  private _currentMeta: BehaviorSubject<any>;

  private datastore: {
    totalRegistered: number;
    currentSong: any;
    songRegistry: Array<any>;
  };

  constructor(private contractService: ContractsService) {
    this.unsubscribe = new Subject<void>();

    this.datastore = {
      totalRegistered: null,
      currentSong: null,
      songRegistry: []
    };

    this._totalRegistered = new BehaviorSubject<number>(null);
    this._currentSong = new BehaviorSubject<any>(null);
    this._songRegistry = new BehaviorSubject<Array<any>>([]);
    this._getSong = new BehaviorSubject<Array<any>>([]);
    this._currentMeta = new BehaviorSubject<any>(null);

    this.contractService.init();
  }


  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


  get totalRegistered(): Observable<number> {
    return this._totalRegistered.asObservable();
  }


  get currentSong(): Observable<any> {
    return this._currentSong.asObservable();
  }


  get songRegistry(): Observable<Array<any>> {
    return this._songRegistry.asObservable();
  }


  get currentMeta(): Observable<any> {
    return this._currentMeta.asObservable();
  }


  public updateTotalRegistered(): void {
    this.contractService.getNrSongs((error: any, result: any) => {
      if (error) {
        console.error(error);
        return;
      } else {
        const nrSongs = result.toNumber();
        this.datastore.totalRegistered = nrSongs;
        this._totalRegistered.next(nrSongs);
      }
    });
  }


  /**
   * Construct a list of registered songs on the contract.
   */
  public getAllRegistered(): void {
    this.totalRegistered
      .pipe(takeUntil(this.unsubscribe)) 
      .subscribe(total => {
        if (total === null) {
          // if no total stored, get total
          this.updateTotalRegistered();
        } else if (total > 0) {
          // otherwise, clear current registry...
          this.datastore.songRegistry = [];
          // and iterate over total num songs, calling getSong() for each index
          for (let i = 0; i < total; i++) {
            this.contractService.getSong(i, (error: any, result: any) => {
              if (error) {
                console.error(error);
                return;
              } else {
                this.datastore.songRegistry.push(result);
              }
            });
          }
          console.log('Song registry =>', this.datastore.songRegistry);
          // Emit copy of song registry to subscribers
          this._songRegistry.next(this.datastore.songRegistry);
        }
      });
  }


  public updateCurrentSong(): void {
    var currentTime = Math.floor(Date.now() / 1000);

    this.contractService.getCurrentSong(currentTime, (error: any, result: any) => {
      if (error) {
        console.error(error);
        return;
      } else {
        let currentSong = {};

        if (result[2] != 0) {
          currentSong = {
            index: (result[0]) ? result[0].toNumber() : null,
            seek: (result[1]) ? result[1].toNumber() : null,
            duration: (result[2]) ? result[2].toNumber() : null,
            songsQueuedCount: (result[3]) ? result[3].toNumber() : null
          }
        }

        this.datastore.currentSong = currentSong;
        this._currentSong.next(currentSong);
      }
    })
  }


  public getSong(index: number): Observable<Array<any>> {
    this.contractService.getSong(index, (error: any, result: any) => {
      if (error) {
        console.error(error);
        this._getSong.error(error);
      } else {
        this._getSong.next(result);
      }
    });

    return this._getSong.asObservable();
  }


  public updateMeta(url: string): void {
    console.log('url', url);

    if (!url) {
      console.log('Req. URL empty');
      return;
    }

    var urlIsValid = this.isValidURL(url);
    
    if (urlIsValid) {
      fetchFileAsBuffer(url).then(parse).then((tag: any) => {
        this._currentMeta.next(tag);
      });
    }
  }

  private isValidURL(url): boolean {
    if (!url) {
      return false;
    }

    if (!url.length) {
      return false;
    }

    let parser = document.createElement('a');
    parser.href = url;

    if (parser.protocol && parser.host && parser.pathname) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: Get queue (or just up next)
}
