import { Injectable } from '@angular/core';
declare let Web3: any;
//declare let web3: any;
declare let window: any;
declare let jQuery: any;

@Injectable({
  providedIn: 'root'
})
export class ContractsService {

  public Contract;
  public web3 = null;
  public instance = null;

  constructor() {
    if (typeof window.web3 !== 'undefined') {
      this.bootstrap();
    } else {
      // XXX: replace this...
      console.warn('Please use a dapp browser like mist or MetaMask plugin for chrome.');
    }
  }

  bootstrap(): void {
    // Get contract
    let that = this;
    var data = {
        address: "0x163cc6ca8157ef8d099cf5a61de6c4477d700785",
        network: "rinkeby",
        endpoint: "https://rinkeby.infura.io/",
        abi: [{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getQueued","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"creator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nrQueued","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getSong","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newUserAddress","type":"address"},{"name":"newUserName","type":"string"}],"name":"addUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"timestamp","type":"uint256"}],"name":"getCurrentSong","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxSongLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nrSongs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"title","type":"string"},{"name":"artist","type":"string"},{"name":"length","type":"uint16"},{"name":"swarmHash","type":"bytes32"}],"name":"addSong","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"queueSong","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxQueueTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
    };
    this.Contract = data;
    // Do initialize provider
    jQuery(document).ready(function () {
      console.log('Initializing playlist...');
      that.init();
      that.main();
    });
  }

  // Get all songs available to be queued
  getNrSongs = function (cb): void {
    this.instance.nrSongs(function (error, result) {
      cb(error, result);
    });
  }
  
  // Get the number of times people put coins in the jukebox
  getTotalQueueLength = function (cb): void {
    this.instance.nrQueued(function (error, result) {
        cb(error, result);
    });
  }

  // Anyone can queue a song, but only an added user has
  // permissions to add a song to the registry of songs
  // Adds a new user address:
  addUser = function (userAddress, cb): void {
    this.instance.addUser(userAddress, function (error, result) {
        cb(error, result);
    });
  }

  // Add a song to the registry of songs (approved / registered users only)
  addSong = function (title, artist, length, swarmHash, cb): void {
    this.instance.addSong(title, artist, length, swarmHash, function (error, result) {
        cb(error, result);
    });
  }

  // Add a song to the queue
  // Song needs to be registered first
  queueSong = function (index, cb): void {
    this.instance.queueSong(index, function (error, result) {
        cb(error, result);
    });
  }

  // Get metadata about a song by its index
  // returns: song.title, song.artist, song.length
  getSong = function (index, cb): void {
    this.instance.getSong(index, function (error, result) {
        cb(error, result);
    });
  }

  // Get the currently playing song
  // returns: song index in the array (index), the current time index of playback (seek), and the remaining time untill the end of the song (duration)
  getCurrentSong = function (timestamp, cb): void {
    // XXX (drew): double check change of index to timestamp
    this.instance.getCurrentSong(timestamp, function (error, result) {
        cb(error, result);
    });
  }

  // After getting the current song queue index (see: fn getCurrentSong())
  // Take that index and get the current queued item (song)
  // returns: queued.startTime, queued.song.index
  getQueued = function (index, cb): void {
    this.instance.getQueued(index, function (error, result) {
        cb(error, result);
    });
  }

  // Initialize MetaMask / provider bridge
  init = function (): void {
    // We create a new Web3 instance using either the Metamask provider
    // or an independant provider created towards the endpoint configured for the contract.
    this.web3 = new Web3(
        (window.web3 && window.web3.currentProvider) ||
        new Web3.providers.HttpProvider(this.Contract.endpoint));

    console.log('Welcome to the Web 3.0', this.web3);

    // Create the contract interface using the ABI provided in the configuration.
    var contract_interface = this.web3.eth.contract(this.Contract.abi);

    // Create the contract instance for the specific address provided in the configuration.
    this.instance = contract_interface.at(this.Contract.address);
  };

  // Main - Let's kick out the jams
  main = function (): void {
    var that = this;
    this.getNrSongs(function (error, result) {
      if (error) {
          console.error(error);
          return;
      }
      // XXX (drew):  toNumber()?
      // not sure where this prototype is from
      // but it seems to work
      var nrSongs = result.toNumber();
      console.log("Total nr songs", nrSongs)

      // Non-base 16 numbers like 0 throw an error;
      if (nrSongs > 0) {
        that.getSong(0, function (error, result) {
          if (error) {
            console.error(error);
            return;
          }
  
          console.log("Song meta data", result);
  
          that.queueSong(0, function (error, result) {
            if (error) {
              console.error(error);
              return;
            }
            console.log("Queued a song.");
          });
        });
      }

    });
  };
}
