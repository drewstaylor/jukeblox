import { Component, OnInit, OnDestroy } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-song',
  templateUrl: './search-song.component.html',
  styleUrls: ['./search-song.component.scss']
})
export class SearchSongComponent implements OnInit, OnDestroy {

  public searchResults: Array<any>;
  public queryField: FormControl;
  public defaultImage: string;

  private unsubscribe: Subject<void>;

  constructor(private libraryService: LibraryService) {
    this.searchResults = [];
    this.queryField = new FormControl();
    this.unsubscribe = new Subject<void>();
    this.defaultImage = 'assets/images/drake-cover__large.png';
  }

  ngOnInit() {
    this.queryField.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        mergeMap((value: any) => {
          return this.libraryService.search(value);
        })
      )
      .subscribe((result: any) => {
        console.log(result);
      });
  }


  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


  public search(queryString: string) {

  }

}
