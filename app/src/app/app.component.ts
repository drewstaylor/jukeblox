import { Component, OnInit } from '@angular/core';
import { ContractsService } from './services/contracts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  constructor(private contractsService: ContractsService) {}

  ngOnInit() {
    
  }
}
