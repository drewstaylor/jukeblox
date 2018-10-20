import { Component, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ContractsService } from '../services/contracts.service';

declare let jQuery: any;

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  private iterations: number = 0;

  public title: string = "Jukeblox";
  public userNetworkProvider;
  public navigationDisabled: boolean = true;
  public targetProviderNetwork: string;

  constructor(private contractsService: ContractsService) {
    this.targetProviderNetwork = this.contractsService.network;
    this.contractsService.init();
  }

  ngOnInit() {
    this.userNetworkProvider = this.contractsService.currentNetwork.subscribe(network => {
      this.userNetworkProvider = this.contractsService.networksMap[network];
      // Enable navigation to '/play' if user MetaMask
      // account is connected to the correct provider
      if (this.userNetworkProvider == this.targetProviderNetwork) {
        console.log("Navigation enabled");
        this.navigationDisabled = false;
      } else {
        console.log('Navigation disabled', this.userNetworkProvider);
        if (network < 0) {
          jQuery('#metaMaskDisabled').modal('show');
        } else {
          // Ignore the initial values load
          // There has to be a better way to do this
          // But on the real, I am very tired
          if (this.iterations > 0) {
            jQuery('#incorrectMetaMaskProvider').modal('show');
          }
          else
            ++this.iterations;
        }
      }
    });
  }

  ngOnDestroy() {
    this.contractsService.currentNetwork.unsubscribe();
  }

}
