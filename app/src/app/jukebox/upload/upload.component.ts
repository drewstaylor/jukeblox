import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { SwarmService } from '../../services/swarm.service';
import { ContractsService } from '../../services/contracts.service';
import { NotificationsComponent } from '../../services/notifications/notifications.component';
import { parse } from 'id3-parser';
import { convertFileToBuffer } from 'id3-parser/lib/universal/helpers';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DefaultUrlHandlingStrategy } from '@angular/router/src/url_handling_strategy';
declare var jQuery: any;


// interface SongDuration {
//   hours: number;
//   minutes: number;
//   seconds: number;
// }


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  @ViewChild('notifierModalOne') notifierOne: NotificationsComponent;
  @ViewChild('notifierModalTwo') notifierTwo: NotificationsComponent;
  @ViewChild('audioElement') audioElement: ElementRef;

  public file: File;
  public audioUrl: any;
  public filePath: string;
  public chosenSongHash: string;
  public fileReady: boolean = false;
  public id3Tag: any;
  public sanitizedAlbumArt: SafeResourceUrl;
  public queuable;
  public nrSongs;
  public waitingForRegistryConfirmation: boolean = false;

  constructor(
    private swarmService: SwarmService, 
    private contractsService: ContractsService,
    private sanitizer: DomSanitizer
  ) {
    this.file = null;
    this.filePath = null;
    this.chosenSongHash = null;

    this.contractsService.init();
  }

  ngOnInit() {
    var that = this;
    // get new total of items in library
    this.contractsService.getNrSongs(function (error, result) {
      if (error) {
          console.error(error);
          return;
      }
      var nrSongs = result.toNumber();
      that.nrSongs = nrSongs;
      console.log('NRSONGS INIT', that.nrSongs);
    });
    // Bind dialog reset to modal close event
    jQuery('#uploadModal')
    .on('hidden.bs.modal', () => {
      this.cancelUpload();
    });

    // console.log(this.audioElement);
    // this.audioElement.nativeElement.src = "http://localhost:4200/poop";
  }


  public openUploadModal(): void {
    jQuery('#addSongModal').modal('hide');
    jQuery('#uploadModal').modal('show');
  }


  public cancelUpload(): void {
    //this.resetFileAndMeta();
    jQuery('#uploadModal').modal('hide');
    jQuery('#addSongModal').modal('show');
  }


  public dropped(event: UploadEvent) {
    var that = this;
    const droppedFile = event.files[0];
    console.log(droppedFile);
 
    // Is it a file?
    if (droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {

        // Here you can access the real file
        console.log(droppedFile.relativePath, file);

        this.file = file;
        this.filePath = droppedFile.relativePath;

        if (file.type === 'audio/mp3') {
          // Parse ID3 tags
          convertFileToBuffer(file).then(parse).then((tag: any) => {
            this.id3Tag = tag;

            this.audioUrl = URL.createObjectURL(file);
            this.audioElement.nativeElement.src = this.audioUrl;

            if (tag.image) {
              const base64ImageString = btoa(
                String.fromCharCode.apply(null, tag.image.data)
              );
              const imageSrc = 'data:' + tag.image.mime + ';base64, ' + base64ImageString;
              const img = document.createElement('img');
  
              img.src = imageSrc;
              img.onerror = () => {
                this.sanitizedAlbumArt = null;
              };
              img.onload = () => {
                this.sanitizedAlbumArt = this.sanitizer.bypassSecurityTrustUrl(imageSrc);
              };
            }

          });
        } else {
          // TODO: put validation / error message here
        }

        /**
         * TODO: ID3 reading here...
         */

        /**
        // You could upload it like this:
        const formData = new FormData()
        formData.append('logo', file, relativePath)

        // Headers
        const headers = new HttpHeaders({
          'security-token': 'mytoken'
        })

        this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
        .subscribe(data => {
          // Sanitized logo returned from backend
        })
        **/

      });
    } else {
      // It was a directory (empty directories are added, otherwise only files)
      const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      console.log(droppedFile.relativePath, fileEntry);
    }
  }


  public uploadFile(file: File): void {
    this.swarmService.upload(this.file, this.filePath)
      .toPromise()
      .then(response => {
        console.log('Upload response =>', response);
        if (!response.error) {
          // Store the uploaded song's hash
          this.chosenSongHash = response.data.swarm.storage_hash;
          //this.resetFileAndMeta();
          jQuery('#uploadModal').modal('hide');
          const msgType = 'success';
          const msgText = 'Thanks for the sweet tune! You can add it to the Jukeblox library once your transaction confirms';
          this.notifierOne.notify(msgType, msgText, false, false);
          // Unlock add to queue
          this.fileReady = true;
          // Add song to registry
          this.addSongToRegistry();
        } else {
          const msgType = 'danger';
          const msgText = `Sorry, but something went wrong when trying to upload your file: ${response.error}`;
          this.notifierTwo.notify(msgType, msgText, false, false);
        }
      })
      .catch(error => {
        console.error(error);
        const msgType = 'danger';
        const msgText = `Sorry, but something went wrong when trying to upload your file: ${error}`;
        this.notifierTwo.notify(msgType, msgText, false, false);
      });
  }

 
  public fileOver(event){
    console.log(event);
  }
 

  public fileLeave(event){
    console.log(event);
  }

  public addSongToRegistry = function (): void {
    var that = this;
    console.log('this.nrSongs',this.nrSongs);
    console.log('addSongToRegistry');
    console.log('this.id3Tag', this.id3Tag);
    console.log('addSong params =>', [this.id3Tag.title, this.id3Tag.artist, 0, this.chosenSongHash]);
    // Put it on the blockchain waddup
    // XXX (drew): TODO: Check for user permissions
    this.contractsService.addSong(
      (this.id3Tag.hasOwnProperty('title')) ? this.id3Tag.title : null, 
      (this.id3Tag.hasOwnProperty('artist')) ? this.id3Tag.artist : null, 
      (this.id3Tag.hasOwnProperty('duration')) ? this.id3Tag.duration : null, 
      (this.chosenSongHash) ? this.chosenSongHash : null,
      function (error, result) {
        if (error) {
          console.error(error);
          return;
        }
        var addSongResponse = result;
        // tx hash
        console.log(addSongResponse);
        // get new total of items in library
        that.waitingForRegistryConfirmation = true;
        that.waitForSongRegistry(that.nrSongs);
    });
  }

  // That's right other developers - I'm forcing you to spell the
  // word "Queue" correctly even though you slept for 2 hours
  public addSongToQueue (): void {
    if (this.queuable) {
      if (this.queuable.hasOwnProperty('index')) {
        this.contractsService.queueSong(this.queuable.index, function (error, result) {
          if (error) {
            console.error(error);
            return;
          }
          console.log("Queued a song", result);
        });
      } else {
        console.log('No queuable songs found');
      }
    } else {
      console.log('No queuable songs found');
    }
  }

  public resetFileAndMeta(): void {
    this.file = null;
    this.id3Tag = null;
    this.filePath = null;
    this.chosenSongHash = null;
    this.sanitizedAlbumArt = null;
    this.queuable = null;
    this.fileReady = false;
  }


  public getDuration(event: any): void {
    var duration = event.currentTarget.duration;
    
    if (this.id3Tag) {
      this.id3Tag['duration'] = duration;
    }

    console.log(this.id3Tag);
  }


  public formatDuration(seconds: number): string {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds / 60) - hrs);
    let secs = Math.round(((seconds / 60) - mins) * 60);

    // return {
    //   hours: hrs,
    //   minutes: mins,
    //   seconds: secs
    // };

    let durationString = (hrs) ? hrs.toString() + ':' : '';
    durationString += mins + ':';
    durationString += secs;

    return durationString;
  }

  
  public closeModal(modalType): void {
    jQuery('#' + modalType).modal('hide');
    // Clear idv3 tags
    this.resetFileAndMeta();
  }

  // XXX (drew): Needs refactoring to be robust this won't scale
  // but I could sleep, I could sleep on like a pile of scales
  // true story
  private waitForSongRegistry = function (nrSongs) {
    var that = this;
    this.contractsService.getNrSongs(function (error, result) {
      if (error) {
          console.error(error);
          return;
      }
      // Compare playlist height to see if block was confirmed
      if (result.toNumber() > nrSongs) {
        that.nrSongs = result.toNumber();
        console.log('Block resolved...');
        // Create queuable item
        that.queuable = {};
        that.queuable.index = that.nrSongs - 1;
        console.log('that.queuable',that.queuable);
        // Unlock add to queue button
        that.waitingForRegistryConfirmation = false;
      } else {
        setTimeout(function () {
          //console.log('Polling for playlist height...', [result.toNumber(), nrSongs]);
          that.waitForSongRegistry(that.nrSongs);
        }, 2000);
      }
    });
  }

}
