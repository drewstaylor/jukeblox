import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

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
  public nrSongs;
  public web3Enabled: boolean;
  public currentSong;
  public currentQueued;
  public isResumableInstance: boolean;
  public id3Tag: object;
  public currentNetwork;
  public currentNetworkChange: Subject<number> = new BehaviorSubject<number>(null);
  
  // Blockchain instance parameters
  private contractAddress: string = '0x9ad1ddae7613cf5980c097cf08ca8dd615922dc0';
  public network: string = "rinkeby";

  // Networks
  readonly networks = {
    mainnet: "1",
    morden: "2",
    ropsten: "3",
    rinkeby: "4",
    kovan: "42"
  };
  readonly networksMap = {
    1: "mainnet",
    2: "morden",
    3: "ropsten",
    4: "rinkeby",
    42: "kovan"
  };
  readonly targetNetwork: string = this.networks.rinkeby;

  constructor() {
    this.isResumableInstance = true;
    this.currentNetwork = this.currentNetworkChange.asObservable();

    if (typeof window.web3 !== 'undefined') {
      this.web3Enabled = true;
      this.currentSong = {};

      window.addEventListener('load', async () => {  
        // Prompt for MetaMask account access
        // This function is N/A at the moment
        // but will go into effect (e.g. produce
        // a login prompt from MetaMask as of Nov. 2)
        try {
          await window.ethereum.enable();
          //console.log('Ethereum enabled', window.ethereum);
        } catch (error) {
          console.log('Request to access MetaMask denied', error);
        }
      });

      this.bootstrap();
    } else {
      console.warn('Please use a dapp browser like mist or MetaMask plugin for chrome.');
      this.web3Enabled = false;
      this.currentNetworkChange.next(-1);
    }
  }

  bootstrap(): void {
    // Get contract
    let that = this;
    var data = {
        address: this.contractAddress,
        network: this.network,
        endpoint: "https://rinkeby.infura.io/",
        abi: [{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getQueued","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"creator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nrQueued","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getSong","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint16"},{"name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newUserAddress","type":"address"},{"name":"newUserName","type":"string"}],"name":"addUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"timestamp","type":"uint256"}],"name":"getCurrentSong","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxSongLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"title","type":"string"},{"name":"artist","type":"string"},{"name":"length","type":"uint16"},{"name":"swarmHash","type":"bytes"}],"name":"addSong","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nrSongs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minimumQueueValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"queueSong","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxQueueTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
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
    var that = this;
    this.instance.queueSong(index, function (error, result) {
        cb(error, result);
        if (!error) {
          that.isResumableInstance = false;
        }
    });
  }

  // Get metadata about a song by its index
  // returns: song.title, song.artist, song.length, song.swarmHash
  getSong = function (index, cb): void {
    this.instance.getSong(index, function (error, result) {
        cb(error, result);
    });
  }

  // Get the currently playing song
  // returns: song index in the array (index), the current time index of playback (seek), and the remaining time untill the end of the song (duration)
  getCurrentSong = function (timestamp, cb): void {
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

  public addSongToRegistry = function (): void {
    var that = this;
    console.log('addSongToRegistry');
    console.log('this.id3Tag', this.id3Tag);
    console.log('addSong params =>', [this.id3Tag.title, this.id3Tag.artist, this.id3Tag.duration, this.chosenSongHash]);
    // Put it on the blockchain waddup
    this.addSong(
      (this.id3Tag.hasOwnProperty('title')) ? this.id3Tag.title : null, 
      (this.id3Tag.hasOwnProperty('artist')) ? this.id3Tag.artist : null, 
      (this.id3Tag.hasOwnProperty('duration')) ? this.id3Tag.duration : null, 
      (this.id3Tag.swarmHash) ? this.id3Tag.swarmHash : null,
      function (error, result) {
        if (error) {
          console.error(error);
          return;
        }
        var addSongResponse = result;
        // tx hash
        console.log(addSongResponse);
    });
  };

  // Initialize MetaMask / provider bridge
  init = function (): void {
    if (!this.web3Enabled) {
      var test = 1000;
      setTimeout(() => {
        this.currentNetworkChange.next(test);
      }, 0);
      return;
    }

    // We create a new Web3 instance using either the Metamask provider
    // or an independant provider created towards the endpoint configured for the contract.
    this.web3 = new Web3(
        (window.web3 && window.web3.currentProvider) ||
        new Web3.providers.HttpProvider(this.Contract.endpoint));

    //console.log('Welcome to the Web 3.0', this.web3);

    // Verify MetaMask network
    this.web3.version.getNetwork((error, network) => {

      if (error) {
        console.log("Error determining user Ethereum network", error);
        return;
      }

      this.currentNetworkChange.next(parseInt(network));

      // Debug network type:
      /*switch (network) {
        case this.networks.mainnet:
          console.log('This is mainnet');
          break
        case this.networks.morden:
          console.log('This is the deprecated Morden test network.');
          break
        case this.networks.ropsten:
          console.log('This is the Ropsten test network.');
          break
        case this.networks.rinkeby:
          console.log('This is the Rinkeby test network.');
          break
        case this.networks.kovan:
          console.log('This is the Kovan test network.');
          break
        default:
          console.log('This is an unknown network.');
      }*/
    });

    //console.log("NETWORK =>", currentProvider);

    // Create the contract interface using the ABI provided in the configuration.
    var contract_interface = this.web3.eth.contract(this.Contract.abi);

    // Create the contract instance for the specific address provided in the configuration.
    this.instance = contract_interface.at(this.Contract.address);
  };

  // Let's kick out the jams
  main = function (): void {
    if (!this.web3Enabled) {
      this.currentNetworkChange.next(-1);
      return;
    }

    var that = this;
    this.getNrSongs(function (error, result) {
      if (error) {
          console.error(error);
          return;
      }

      var nrSongs = result.toNumber();
      that.nrSongs = nrSongs;
      console.log("Total nr songs", nrSongs);

      // Non-base 16 numbers like 0 throw an error;
      if (nrSongs > 0) {

        // Check if there are songs queued
        that.getTotalQueueLength (function (error, result) {
          if (error) {
            console.error(error);
            return;
          }
          var queueLength = result.toNumber();
          console.log('total queue length', queueLength);
        });

        
        /*that.getSong(0, function (error, result) {
          if (error) {
            console.error(error);
            return;
          }
          var originalSong = result;
          // Convert BigNumber to valid mp3 duration
          originalSong[2] = originalSong[2].toNumber();
          // Convert hex swarm value to real swarm hash
          originalSong[3] = that.web3.toAscii(originalSong[3]);
          console.log("Song meta data", originalSong);
  
          /*that.queueSong(0, function (error, result) {
            if (error) {
              console.error(error);
              return;
            }
            console.log("Queued a song.");
          });*
        });*/

        // Get current song if available
        var currentTime = Math.floor(Date.now() / 1000);
        that.getCurrentSong(currentTime, function (error, result) {
          if (error) {
            console.error(error);
            return;
          }
          // return (index, seek, duration, songsQueuedCount);
          that.currentSong.index = (result[0]) ? result[0].toNumber() : null;
          that.currentSong.seek = (result[1]) ? result[1].toNumber() : null;
          that.currentSong.duration = (result[2]) ? result[2].toNumber() : null;
          that.currentSong.songsQueuedCount = (result[3]) ? result[3].toNumber() : null;
          console.log('getCurrentSong', that.currentSong);

          // Now get the next queued song
          if (that.currentSong.index !== null) {
            that.getQueued(that.currentSong.index, function (error, result) {
              if (error) {
                console.error(error);
                return;
              }
              that.currentQueued = (result[1]) ? result[1].toNumber() : null;
              console.log('Next in queue =>', that.currentQueued);
            });
          }
        });
      }

    });
  };
}
