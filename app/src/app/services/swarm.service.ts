import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwarmService {

  private apiUrl: string;
  private namespace: string;
  private jsmediatags;

  constructor(private http: HttpClient) {
    this.apiUrl = 'https://api.jukeblox.io/api';
    this.namespace = '/swarm/upload';
  }


  public upload(file: File, relativePath: string): Observable<any> {
    console.log ('Attempting upload with payload:', file);
    
    const formData = new FormData();
    formData.append('file', file, relativePath);

    const payload = {
      file: file
    };

    return this.http.post(this.apiUrl + this.namespace, formData);
  }

  // Parse metadata from mp3 ID3v1 and ID3v2 tags
  public parseMetaData(): void {
    // ...
  };
}
