import { Injectable } from '@angular/core';
declare let Web3: any;
declare let web3: any;
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class ContractsService {

  constructor() {
    console.log(web3);

    if (typeof window.web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      // XXX: replace this...
      console.warn('Please use a dapp browser like mist or MetaMask plugin for chrome.');
    }
  }
}
