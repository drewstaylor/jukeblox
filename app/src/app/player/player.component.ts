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
  private isResumableInstance: boolean = true;

  public isMuted: boolean;

  constructor(private contractService: ContractsService, private musicService: MusicService) {
    this.unsubscribe = new Subject<void>();
    this.isMuted = false;
    this.currentSong = {};
    this.playlist = [];
    this.serverUrl = 'https://api.jukeblox.io/';
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

    // Get the currently playing queue object by the current timestamp.
    this.contractService.getCurrentSong(currentTime, (error, result) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log("getCurrentSong =>", result);

        // return (queueIndex, seek, duration (time left), songsQueuedCount (how many songs are queued after this one));
        if (!result || result[2] == 0 || result[2].toNumber() == 0) {
            // Non item, wait and reload
            setTimeout(() => {
              this.updateCurrent();
            }, 5000);
            return;
        }

        this.currentSong.queueIndex = result[0].toNumber();
        this.currentSong.seek = result[1].toNumber();
        this.currentSong.duration = result[2].toNumber();
        this.currentSong.songsQueuedCount = result[3].toNumber();
        console.log('getCurrentSong parsed =>', this.currentSong);

        // We got the queued object index, now get the actual queued object.
        this.contractService.getQueued(this.currentSong.queueIndex, (error, result) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log("getQueued =>", result);

            // Get current song meta data
            var songIndex = result[1].toNumber();
            console.log("Get song by index =>", songIndex)
            this.contractService.getSong(songIndex, (error, result) => {
                if (error) {
                    console.error(error);
                    return;
                }
                console.log('getSong =>', result);
                // Track metadata
                const title = result[0];
                const artist = result[1];
                const length = result[2].toNumber();
                const swarmHash = web3.toAscii(result[3]);
                // File location
                const currentUrl = this.serverUrl + swarmHash + '.mp3';
                
                // Clear the resumeable seek state if the current user
                // has queued the newest song in the current session
                if (!this.contractService.isResumableInstance) {
                  this.isResumableInstance = false;
                }
                // Playback seeking only required on first page load
                if (this.isResumableInstance) {
                  this.playSong(this.serverUrl + swarmHash + '.mp3', this.currentSong.seek);
                  this.isResumableInstance = false;
                } else {
                  this.playSong(this.serverUrl + swarmHash + '.mp3', 0);
                }

                this.musicService.updateMeta(currentUrl);

                // Timeout for the duration left for the song to reload.
                let timeOut = this.currentSong.duration * 1000;
                setTimeout(() => {
                    this.updateCurrent();
                }, timeOut);
            });
        });
    });
  }

    private playSong(file, seek) : void {

        const playlistEntry = {
            file: file
        };

        const playlist = [playlistEntry];

        console.log("Playlist =>", playlist);
        console.log('JWPLAYER =>', this.player);

        this.player.on('playlist', playlist => {
            console.log('- - - L O A D E D    P L A Y L I S T - - -', playlist)
            // this.player.play();
        });

        this.player.load(playlist);
        this.player.seek(seek);
        this.player.play();
    }
}
