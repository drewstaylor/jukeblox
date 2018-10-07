import { Component, OnInit } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { SwarmService } from '../../services/swarm.service';
declare var jQuery: any;

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  public file: File;
  public filePath: string;

  constructor(private swarmService: SwarmService) {
    this.file = null;
    this.filePath = null;
  }

  ngOnInit() {
    // Bind dialog reset to modal close event
    jQuery('#uploadModal')
    .on('hidden.bs.modal', () => {
      this.cancelUpload();
    })
  }


  public openUploadModal(): void {
    jQuery('#addSongModal').modal('hide');
    jQuery('#uploadModal').modal('show');
  }


  public cancelUpload(): void {
    this.file = null;
    jQuery('#uploadModal').modal('hide');
    jQuery('#addSongModal').modal('show');
  }


  public dropped(event: UploadEvent) {
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
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
  }
 

  public fileOver(event){
    console.log(event);
  }
 

  public fileLeave(event){
    console.log(event);
  }

}
