import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../../services/library.service';

@Component({
  selector: 'app-search-song',
  templateUrl: './search-song.component.html',
  styleUrls: ['./search-song.component.scss']
})
export class SearchSongComponent implements OnInit {

  constructor(private libraryService: LibraryService) { }

  ngOnInit() {
  }

}
