import { Component, OnInit } from '@angular/core';
import { parse } from 'id3-parser';
import { convertFileToBuffer, fetchFileAsBuffer } from 'id3-parser/lib/universal/helpers';
import universalParse from 'id3-parser/lib/universal';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {

  public sanitizedAlbumArt: SafeResourceUrl;
  public id3Tag: any;
  public defaultImage: string;

  constructor(private sanitizer: DomSanitizer) {
    this.sanitizedAlbumArt = null;
    this.id3Tag = null;
    this.defaultImage = 'assets/images/drake-cover__large.png';
  }

  ngOnInit() {
    console.log('Panel init');
    const url = 'http://ec2-54-158-49-223.compute-1.amazonaws.com:3000/10ab9eff3ee738759277c9526b7bee655b071d91d898f81ca3042a1f57a21ee8.mp3';
    fetchFileAsBuffer(url).then(parse).then((tag: any) => {
      console.log('ID3 PARSE =>', tag);

      this.id3Tag = tag;

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
  }

}
