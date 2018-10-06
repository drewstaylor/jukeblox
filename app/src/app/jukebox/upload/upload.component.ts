import { Component, OnInit } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
declare var jQuery: any;

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  public file: UploadFile;

  constructor() {
    this.file = null;
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
    this.file = event.files[0];
 
    // Is it a file?
    if (this.file.fileEntry.isFile) {
      const fileEntry = this.file.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {

        // Here you can access the real file
        console.log(this.file.relativePath, file);

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
      const fileEntry = this.file.fileEntry as FileSystemDirectoryEntry;
      console.log(this.file.relativePath, fileEntry);
    }
  }
 

  public fileOver(event){
    console.log(event);
  }
 

  public fileLeave(event){
    console.log(event);
  }

}
