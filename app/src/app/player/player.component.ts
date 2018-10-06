import { Component, OnInit } from '@angular/core';
declare var jwplayer: any;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log(jwplayer);
    const playlist = [
      {
        file: '../../assets/audio/01\ Ataride.mp3'
      },
      {
        file: '../../assets/audio/Doom\ EP-002-Agent\ Orange-Wanting\ U'
      },
      {
        file: '../../assets/audio/01\ Out\ There.mp3'
      }
    ];
    // Setup the player
    const player = jwplayer('player').setup({
      playlist: playlist,
      width: 500,
      height: 40,
      controls: false,
      autostart: true
    });

    // // Listen to an event
    // player.on('pause', (event) => {
    //   alert('Why did my user pause their video instead of watching it?');
    // });

    // player.seek(30);

    // // Call the API
    // const bumpIt = () => {
    //   const vol = player.getVolume();
    //   player.setVolume(vol + 10);
    // }
    // bumpIt();
  }

}
