import { Component, OnInit, OnDestroy } from '@angular/core';
import { MusicService } from '../services/music.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ContractsService } from '../services/contracts.service';
declare var jwplayer: any;
declare var web3: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void>;
  private currentSong: any;
  private playlist: Array<any>;
  private player: any;
  private serverUrl: string;

  public isMuted: boolean;

  constructor(private contractService: ContractsService) {
    this.unsubscribe = new Subject<void>();
    this.isMuted = false;
    this.currentSong = {};
    this.playlist = [];
    this.serverUrl = 'http://ec2-54-158-49-223.compute-1.amazonaws.com:3000/';
  }

  ngOnInit() {
    // console.log(jwplayer);
    // // const playlist = [
    // //   {
    // //     file: '../../assets/audio/01\ Ataride.mp3'
    // //   },
    // //   {
    // //     file: '../../assets/audio/Doom\ EP-002-Agent\ Orange-Wanting\ U'
    // //   },
    // //   {
    // //     file: '../../assets/audio/01\ Out\ There.mp3'
    // //   }
    // // ];

    // // const playlist = [];
    this.jwplayerSetup();
    this.updateCurrent();

    // // Setup the player
    // this.player = jwplayer('player').setup({
    //   playlist: this.playlist,
    //   width: 500,
    //   height: 40,
    //   controls: false,
    //   autostart: true,
    //   mute: false
    // });

    // console.log(this.player.getMute());
  }


  private jwplayerSetup(): void {
    console.log(jwplayer);
    const placeHolder = '../../assets/audio/01\ Out\ There.mp3';

    // const playlist = [];

    // this.updateCurrent();

    // Setup the player
    this.player = jwplayer('player').setup({
      file: placeHolder,
      width: 500,
      height: 40,
      controls: false,
      autostart: false,
      mute: false,
      repeat: false
    });

    // this.player.load(playlist);
    // this.player.playlistItem(0);

    // console.log('JWPLAYER =>', this.player);

    this.player.on('meta', value => {
      console.log('New meta! =>', value);
    });

    // this.player.on('setupError', message => {
    //   console.error(message);
    // });

    // console.log(this.player.getMute());
  }


  public toggleSound(): void {
    this.isMuted = this.player.getMute();
    if (this.isMuted) {
      this.player.setMute(false);
    } else {
      this.player.setMute(true);
    }
    this.isMuted = this.player.getMute();
  }


  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


  public updateCurrent(): void {
    // Get current song if available
    var currentTime = Math.floor(Date.now() / 1000);
    this.contractService.init();

    // const fn = () => {

      this.contractService.getCurrentSong(currentTime, (error, result) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log("getCurrentSong result", result);

        // return (index, seek, duration, songsQueuedCount);
        this.currentSong.queueIndex = (result[0]) ? result[0].toNumber() : null;
        this.currentSong.seek = (result[1]) ? result[1].toNumber() : null;
        this.currentSong.duration = (result[2]) ? result[2].toNumber() : null;
        this.currentSong.songsQueuedCount = (result[3]) ? result[3].toNumber() : null;
        console.log('getCurrentSong parsed', this.currentSong);

        // If nothing currentyl playing, wait 5 sec and reload.
        if (this.currentSong.duration <= 0) {
            setTimeout(() => {
              this.updateCurrent();
            }, 5000);
            return;
        }

        // We got the queued object, now get the actual song


        this.contractService.getQueued(this.currentSong.queueIndex, (error, result) => {
          if (error) {
            console.error(error);
            return;
          }
          // Get current song meta data
          this.contractService.getSong(this.currentSong.queueIndex, (error, result) => {
            if (error) {
              console.error(error);
              return;
            }
            console.log('Get song result =>', result);

            const playlistEntry = {
              file: this.serverUrl + web3.toAscii(result[3]) + '.mp3'
            };

            this.playlist.push(playlistEntry);

            console.log(this.playlist);
            console.log('JWPLAYER =>', this.player);

            this.player.on('playlist', playlist => {
              console.log('- - - L O A D E D    P L A Y L I S T - - -', playlist)
              this.player.next();
            });

            this.player.load(this.playlist);

            let timeOut = (this.currentSong.duration) ? this.currentSong.duration * 1000 : 5000;
            setTimeout(() => {
              this.updateCurrent();
            }, timeOut);
          })
        });

      // Now get the next queued song
      // if (this.currentSong.queueIndex !== null) {
      //   // this.contractService.init();
      //   this.contractService.getQueued(this.currentSong.queueIndex, (error, result) => {
      //     if (error) {
      //       console.error(error);
      //       return;
      //     }
      //     this.contractService.currentQueued = (result[1]) ? result[1].toNumber() : null;
      //     console.log('Next in queue =>', this.contractService.currentQueued);
      //   });
      // }
    });
  }
}
