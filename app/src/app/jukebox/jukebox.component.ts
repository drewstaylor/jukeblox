import { Component, OnInit } from '@angular/core';
import { ContractsService } from '../services/contracts.service';
import { MusicService } from '../services/music.service';

@Component({
  selector: 'app-jukebox',
  templateUrl: './jukebox.component.html',
  styleUrls: ['./jukebox.component.scss']
})
export class JukeboxComponent implements OnInit {

  constructor(
    private contractService: ContractsService,
    private musicService: MusicService
  ) { 
    // ...
  }

  ngOnInit() {
    this.musicService.currentSong
      .subscribe(song => {
        if (!song) {
          this.musicService.updateCurrentSong();
        }
        console.log('sonnnnnngggg =>', song);
      });

    // this.musicService.getAllRegistered();

    // this.musicService.totalRegistered
    //   .subscribe(total => {
    //     console.log(11);
    //     if (total === null) {
    //       console.log(22);
    //       this.musicService.updateTotalRegistered();
    //     }
    //     console.log('Total reg. songs =>', total);
    //   });
  }

}
