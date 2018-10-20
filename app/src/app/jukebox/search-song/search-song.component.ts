import { Component, OnInit, OnDestroy } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-song',
  templateUrl: './search-song.component.html',
  styleUrls: ['./search-song.component.scss']
})
export class SearchSongComponent implements OnInit, OnDestroy {

  public searchResults: Array<any>;
  public queryField: FormControl;

  private unsubscribe: Subject<void>;

  constructor(private libraryService: LibraryService) {
    this.searchResults = [];
    this.queryField = new FormControl();
    this.unsubscribe = new Subject<void>();
  }

  ngOnInit() {
    this.queryField.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe((value: any) => {
        console.log(typeof value, value);
      });
  }


  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


  public search(queryString: string) {

  }

}
