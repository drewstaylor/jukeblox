import { Component, OnInit } from '@angular/core';
declare let jwplayer: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log(jwplayer);
    // Setup the player
    const player = jwplayer('player').setup({
      file: 'http://content.jwplatform.com/videos/SJnBN5W3-mjpS2Ylx.mp4',
      width: 500,
      height: 40
    });

    // Listen to an event
    player.on('pause', (event) => {
      alert('Why did my user pause their video instead of watching it?');
    });

    // Call the API
    const bumpIt = () => {
      const vol = player.getVolume();
      player.setVolume(vol + 10);
    }
    bumpIt();
  }

}
