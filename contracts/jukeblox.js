// Get contract
if(typeof(Contracts)==="undefined") var Contracts={};
(function(module, Contracts) {
    var data={
        address: "0x9ad1ddae7613cf5980c097cf08ca8dd615922dc0",
        network: "rinkeby",
        endpoint: "https://rinkeby.infura.io/",
        abi: [{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getQueued","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"creator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nrQueued","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getSong","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint16"},{"name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newUserAddress","type":"address"},{"name":"newUserName","type":"string"}],"name":"addUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"timestamp","type":"uint256"}],"name":"getCurrentSong","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxSongLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"title","type":"string"},{"name":"artist","type":"string"},{"name":"length","type":"uint16"},{"name":"swarmHash","type":"bytes"}],"name":"addSong","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nrSongs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minimumQueueValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"queueSong","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"maxQueueTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
    };
    Contracts["JukeBlox"]=data;
    module.exports=data;
})((typeof(module)==="undefined"?{}:module), Contracts);

function JukeBlox(Contract) {
    this.web3 = null;
    this.instance = null;
    this.Contract = Contract;
}

// Get all songs available to be queued
JukeBlox.prototype.getNrSongs = function (cb) {
    this.instance.nrSongs(function (error, result) {
        cb(error, result);
    });
}

// Get the number of times people put coins in the jukebox
JukeBlox.prototype.getTotalQueueLength = function (cb) {
    this.instance.nrQueued(function (error, result) {
        cb(error, result);
    });
}

// Anyone can queue a song, but only an added user has
// permissions to add a song to the registry of songs
// Adds a new user address:
JukeBlox.prototype.addUser = function (userAddress, cb) {
    this.instance.addUser(userAddress, function (error, result) {
        cb(error, result);
    });
}

// Add a song (registered users only)
JukeBlox.prototype.addSong = function (title, artist, length, swarmHash, cb) {
    this.instance.addSong(title, artist, length, swarmHash, function (error, result) {
        cb(error, result);
    });
}

// Add a song to the queue
// Song needs to be registered first
JukeBlox.prototype.queueSong = function (index, cb) {
    this.instance.queueSong(index, function (error, result) {
        cb(error, result);
    });
}

// Get data about a song
// returns: song.title, song.artist, song.length, song.swarmHash
JukeBlox.prototype.getSong = function (index, cb) {
    this.instance.getSong(index, function (error, result) {
        cb(error, result);
    });
}

// Get the currently playing song
// returns: song index in the array (index), the current time index of playback (seek), and the remaining time untill the end of the song (duration)
JukeBlox.prototype.getCurrentSong = function (timestamp, cb) {
    this.instance.getCurrentSong(index, function (error, result) {
        cb(error, result);
    });
}

// After getting the current song queue index (see: fn getCurrentSong())
// Take that index and get the current queued item (song)
// returns: queued.startTime, queued.song.index
JukeBlox.prototype.getQueued = function (index, cb) {
    this.instance.getQueued(index, function (error, result) {
        cb(error, result);
    });
}

JukeBlox.prototype.init = function () {
    // We create a new Web3 instance using either the Metamask provider
    // or an independant provider created towards the endpoint configured for the contract.
    this.web3 = new Web3(
        (window.web3 && window.web3.currentProvider) ||
        new Web3.providers.HttpProvider(this.Contract.endpoint));

    // Create the contract interface using the ABI provided in the configuration.
    var contract_interface = this.web3.eth.contract(this.Contract.abi);

    // Create the contract instance for the specific address provided in the configuration.
    this.instance = contract_interface.at(this.Contract.address);
};

JukeBlox.prototype.main = function () {
    var that = this;
    this.getNrSongs(function (error, result) {
        if (error) {
            console.error(error);
            return;
        }
        var nrSongs = result.toNumber();
        console.log("Total nr songs", nrSongs)

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
    });
};

JukeBlox.prototype.onReady = function () {
    this.init();
    this.main();
};

var JukeBlox = new JukeBlox(Contracts['JukeBlox']);

$(document).ready(function () {
    JukeBlox.onReady();
});
