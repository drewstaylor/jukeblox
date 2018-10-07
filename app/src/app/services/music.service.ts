import { Injectable } from '@angular/core';
import { ContractsService } from './contracts.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MusicService implements OnDestroy {

  private unsubscribe: Subject<void>;
  private _totalRegistered: BehaviorSubject<number>;
  private _songRegistry: BehaviorSubject<Array<any>>;

  private datastore: {
    totalRegistered: number;
    songRegistry: Array<any>;
  };

  constructor(private contractService: ContractsService) {
    this.unsubscribe = new Subject<void>();

    this.datastore = {
      totalRegistered: null,
      songRegistry: []
    };

    this._totalRegistered = new BehaviorSubject<number>(null);
    this._songRegistry = new BehaviorSubject<Array<any>>([]);
  }


  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


  get totalRegistered(): Observable<number> {
    return this._totalRegistered.asObservable();
  }


  public updateTotalRegistered(): void {
    this.contractService.init();
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


  // TODO: Get list of registered songs
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
          // init contract
          this.contractService.init();
          // and iterate over total num songs, calling getSong() for each index
          for (let i = 0; i < total; i++) {
            // this.contractService.init();
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
      })
    // this.contractService.getSong()
  }

  // TODO: Get current song... Go go go!

  // TODO: Get queue (or just up next)
}
