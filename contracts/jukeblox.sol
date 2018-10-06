pragma solidity ^0.4.21;

contract JukeBlox {
    struct Song {
        string title;
        string artist;
        uint16 length;   // Length in seconds
        address creator;
        uint256 timestamp;
        bytes32 swarmHash;
        uint16 reports;
        uint256 queuedCount;
        uint256 index;  // the index of this object in the array.
    }

    struct User {
        string name;
        uint256 addedTs;
    }

    struct Queued {
        Song song;
        uint256 startTime;
    }

    // All songs
    Song[] songs;

    // All queued songs
    Queued[] queue;

    mapping(address => User) users;

    address public creator;
    uint256 public maxQueueTime = 3600;  // Max one hour of queued material.
    uint256 public nrSongs = 0;
    uint256 public nrQueued = 0;

    constructor() public {
        creator = msg.sender;
        addUser(creator, "Creator");
    }

    function addUser(address newUserAddress, string newUserName) onlyUser public {
        require(users[newUserAddress].addedTs == 0);
        User memory user = User(
            newUserName,
            now
        );
        users[newUserAddress] = user;
    }

    modifier onlyUser {
        require(msg.sender == creator || users[msg.sender].addedTs != 0);
        _;
    }

    function addSong(string title, string artist, uint16 length, bytes32 swarmHash) onlyUser public {
        Song memory song = Song(
            title,
            artist,
            length,
            msg.sender,
            now,
            swarmHash,
            0,
            0,
            nrSongs
        );
        songs.push(song);

        nrSongs++;
    }

    function queueSong(uint256 index) public {
        require(songs.length > index);

        // Find the next start time for a newly queued item.
        uint256 startTime = now;

        if (queue.length > 0) {
            Queued storage lastQueued = queue[queue.length - 1];
            uint nextTime = lastQueued.startTime + lastQueued.song.length + 1;
            if (nextTime > startTime) {
                startTime = nextTime;
            }

            // We only allow queued up till maxQueueTime seconds.
            if (startTime - now > maxQueueTime) {
                revert();
            }
        }

        Song storage song = songs[index];
        Queued memory queued = Queued(
            song,
            startTime
        );
        queue.push(queued);

        nrQueued++;
    }

    function getSong(uint256 index) view public returns(string, string, uint16) {
        Song storage song = songs[index];
        
        return (song.title, song.artist, song.length);
    }

    /**
     * By a given timestamp, get the song playing now and how many seconds into it we are.
     *
     * returns: (song index, seek seconds)
     *  (0, 0, 0) means no song found for the timestamp
     */
    function getCurrentSong(uint256 timestamp) view public returns (uint256, uint256, uint256) {

        for (uint256 index = queue.length - 1; index >= 0; index--) {
            Queued storage queued = queue[index];
            if (timestamp >= queued.startTime) {
                if (timestamp < queued.startTime + queued.song.length) {
                    uint256 seek = timestamp - queued.startTime;
                    uint256 duration = queued.song.length - seek;
                    return (index, seek, duration);
                }
                else {
                    break;
                }
            }
        }
        return (0, 0, 0);
    }

    function getQueued(uint256 index) view public returns(uint256, uint256) {
        Queued storage queued = queue[index];
        return (queued.startTime, queued.song.index);
    }
}
