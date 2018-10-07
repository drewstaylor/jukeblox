import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare let jsmediatags: any;

@Injectable({
  providedIn: 'root'
})
export class SwarmService {

  private apiUrl: string;
  private namespace: string;

  constructor(private http: HttpClient) {
    this.apiUrl = 'http://ec2-54-158-49-223.compute-1.amazonaws.com:3000/api';
    this.namespace = '/swarm/upload';
    //jsmediatags = require('jsmediatags');
  }


  public upload(file: File, relativePath: string): Observable<any> {
    console.log ('Attempting upload with payload:', file);
    
    // const formData = new FormData();
    // formData.append('file', file, relativePath);

    const payload = {
      file: file
    };

    return this.http.post(this.apiUrl + this.namespace, payload);
  }

  // Parse metadata from mp3 ID3v1 and ID3v2 tags
  private parseMetaData(): void {
    // ...
  };
}
