import { Component, OnInit, OnDestroy } from '@angular/core';
import { MusicService } from '../services/music.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ContractsService } from '../services/contracts.service';

declare var jwplayer: any;
declare var web3: any;
declare var require: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void>;
  private currentSong: any;
  private currentPlayUrl: any;
  private playlist: Array<any>;
  private player: any;
  private isResumableInstance: boolean = true;
  private hasActiveListener: boolean = false;
  private Random;

  readonly serverUrl: string = "https://api.jukeblox.io/";
  readonly swarmGateway: string = "https://swarm-gateways.net/bzz:/";

  public isMuted: boolean;
  public jsonLibrary: any;

  constructor(private contractService: ContractsService, private musicService: MusicService) {
    this.unsubscribe = new Subject<void>();
    this.isMuted = false;
    this.currentSong = {};
    this.playlist = [];

    // Local song library
    this.jsonLibrary = require('../../assets/json/library.json');
    console.log('Song Catalogue', this.jsonLibrary);

    // Random number generator (for uniform distribution)
    this.Random = require("random-js");
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
    var that = this;
    //console.log(jwplayer);
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
      console.log('New song meta =>', value);
      // Set song metadata in UI
      //that.musicService.updateMeta(that.currentPlayUrl);
    });

    this.player.on('firstFrame', loadTime => {
      console.log('Playback starting...', loadTime);
      this.musicService.updateMeta(that.currentPlayUrl);
    });

    this.player.on('playlist', playlist => {
      console.log('- - - L O A D E D    P L A Y L I S T - - -', playlist)
      //this.player.play();
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
            //setTimeout(() => {
            //  this.updateCurrent();
            //}, 5000);
            //return;
            console.log('No song currently playing from queue', result);
            this.playRandomSong();
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
                // XXX (drew): Use these unsued vars to set
                // track in UI?
                const title = result[0];
                const artist = result[1];
                const length = result[2].toNumber();
                const swarmHash = web3.toAscii(result[3]);
                
                // Clear the resumeable seek state if the current user
                // has queued the newest song in the current session
                if (!this.contractService.isResumableInstance) {
                  this.isResumableInstance = false;
                }
                // Playback seeking only required on first page load
                if (this.isResumableInstance) {
                  try {
                    this.playSong(this.serverUrl + swarmHash + '/jukeblox.mp3', this.currentSong.seek);
                    this.isResumableInstance = false;
                  } catch (err) {
                    console.log('Error connecting to Swarm gateway', err);
                    // XXX: Add swarm gateway fallback
                    //this.playSong(this.serverUrl + swarmHash + '.mp3', this.currentSong.seek);
                  } 
                } else {
                  // Don't seek unless the using is resuming a 
                  // currently playing song from page load
                  this.playSong(this.serverUrl + swarmHash + '/jukeblox.mp3', 0);
                }
            });
        });
    });
  }

  private playSong(file, seek): void {
      var that = this;

      const playlistEntry = {
          file: file
      };

      const playlist = [playlistEntry];
      this.player.load(playlist);

      console.log("Playlist =>", playlist);
      console.log('JWPLAYER =>', this.player);

      // Only seek as necessary
      if (parseInt(seek) > 0) {
        this.player.seek(seek);
      }

      // Play target song
      this.currentPlayUrl = file;
      //this.player.file = file;

      console.log('Now playing...', that.currentPlayUrl);
      that.player.play().on('complete', function () {
        // On complete, play another song
        if (!that.hasActiveListener) {
          //that.hasActiveListener = true;
          that.updateCurrent();
        }
      });

  }

  private playRandomSong(): void {
    var randomNumberInstance = 0;
    // Fallback if library json not loaded correctly
    if (typeof this.jsonLibrary !== "object") {
      console.log("Song catalogue not loaded, defaulting to song index: 0.");
      return;
    } else if (!this.jsonLibrary.length) {
      console.log("Song catalogue not loaded, defaulting to song index: 0.");
    } else {
      randomNumberInstance = this.randomNumber(0, this.jsonLibrary.length);
      console.log('Random number instance: ', randomNumberInstance);
    }
    // Create song refs.
    let songTarget = this.jsonLibrary[randomNumberInstance];
    let filePath = this.serverUrl + songTarget.swarm + '/jukeblox.mp3';
    // Play the random song
    try {
      this.playSong(filePath, 0);
    } catch (err) {
      console.log('Error connecting to Swarm gateway', err);
    }
  }

  private randomNumber(min: number, max: number): number {
    const Random = this.Random;
    var number,
        random = new Random(Random.engines.mt19937().autoSeed());
    // Generates a random number, within given range,
    // with a uniform distribution
    if (typeof min === "number" && typeof max === "number") {
      number = random.integer(min, max);
    } else {
      // Fallback, but should never happen
      number = 0;
    }
    // Return random index
    return number;
  }

};
