import { Component, OnInit, ViewChild } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { SwarmService } from '../../services/swarm.service';
import { ContractsService } from '../../services/contracts.service';
import { NotificationsComponent } from '../../services/notifications/notifications.component';
import { parse } from 'id3-parser';
import { convertFileToBuffer } from 'id3-parser/lib/universal/helpers';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var jQuery: any;


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  @ViewChild('notifierModalOne') notifierOne: NotificationsComponent;
  @ViewChild('notifierModalTwo') notifierTwo: NotificationsComponent;

  public file: File;
  public filePath: string;
  public chosenSongHash: string;
  public fileReady: boolean = false;
  public id3Tag: any;
  public sanitizedAlbumArt: SafeResourceUrl;

  constructor(
    private swarmService: SwarmService, 
    private contractsService: ContractsService,
    private sanitizer: DomSanitizer
  ) {
    this.file = null;
    this.filePath = null;
    this.chosenSongHash = null;
  }

  ngOnInit() {
    // Bind dialog reset to modal close event
    jQuery('#uploadModal')
    .on('hidden.bs.modal', () => {
      this.cancelUpload();
    });
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
            console.log(tag);

            this.id3Tag = tag;

            const base64ImageString = btoa(
              String.fromCharCode.apply(null, tag.image.data)
            );

            const imageSrc = 'data:' + tag.image.mime + ';base64, ' + base64ImageString;
            this.sanitizedAlbumArt = this.sanitizer.bypassSecurityTrustUrl(imageSrc);
            // this.sanitizedAlbumArt = imageSrc;

            console.log(this.sanitizedAlbumArt);
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
          const msgText = 'Nice! Your song was successfully uploaded. Now you can add it to the queue!';
          this.notifierOne.notify(msgType, msgText, false, false);
          // Unlock add to queue
          this.fileReady = true;
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
        console.log(addSongResponse);
    });
  }    

  public resetFileAndMeta(): void {
    this.file = null;
    this.id3Tag = null;
    this.filePath = null;
    this.chosenSongHash = null;
    this.sanitizedAlbumArt = null;
  }

  public closeModal(modalType): void {
    jQuery('#' + modalType).modal('hide');
    // Clear idv3 tags
    this.resetFileAndMeta();
  }

}
