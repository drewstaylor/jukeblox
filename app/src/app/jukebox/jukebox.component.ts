import { Component, OnInit } from '@angular/core';
import { ContractsService } from '../services/contracts.service';

@Component({
  selector: 'app-jukebox',
  templateUrl: './jukebox.component.html',
  styleUrls: ['./jukebox.component.scss']
})
export class JukeboxComponent implements OnInit {

  constructor(
    private contractService: ContractsService
  ) { 
    // ...
  }

  ngOnInit() {
  }

}
