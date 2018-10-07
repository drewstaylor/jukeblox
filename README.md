# Jukeblox
A `ETHSanFrancisco hackathon 2018 project`, by:
`@mondo989`
`@drewstaylor`
`@functioncreep`
`@Bashlund`

![alt text](https://raw.githubusercontent.com/drewstaylor/jukeblox/master/screenshot.png)

## Inspiration
What does the `Jukebox` featured in the book `The Hitchhiker's guide to Galaxy` look like from an Interplanetary perspective?

1. We firmly believe it must have blockchain built in to even be functional.

2. We firmly *know that it must* be truly decentralized to be accepted as **The Interplanetary Jukebox** by all species of the Galaxy; Silicon, Carbon or Imaginary based.

For example: How can a *Hooloovoo* trust and share a Universal Playlist with a stranger of the *Krikkiters* humanoids species without a consensus mechanism in place?
*Hint: It just can't.*

Caveat: The only known exception of species to *not* enjoy the features of blockchain technology would be the species *Hrarf-Hrarfy* who's life actually flows backwards in time and won't draw any benefits of a block height aligned with the arrow of time, since it will be ever decreasing.

## What it does
It syncs and plays a playlist all over the known Universe.

Curators of songs are added by already existing curators, as a friend invite type of system. Any user with a Ethereum account and 25 cents worth of ether can queue a song to be played.

## How We built it
It's a smart contract managed Universal Jukebox where songs can be put into a queue by inserting a "quarter" (in eth), the songs are served over `Swarm` and played by the web client.

The smart contract is build and deployed using [Superblocks Lab](https://lab.superblocks.com). The web client is build with `Angular` and can upload songs to `Swarm`. These songs metadata is stored in the contract to be searchable by the client.

## Challenges We ran into
Getting `Swarm` to work. Lots of tedious work to analyze network and (micro) instance overload issues.

## Accomplishments that We're proud of
We managed to keep the scope of the project to a feasible level, even though we have lots of features we want and can extend it with, such as voting on songs, royalties of songs played, etc.

A goal was to create `Jukeblox` as decentralized as possible without and centralized backend serving the client. We come up with an algorithm for managing the playlist's time flow to knowing which songs are already played and which song is playing right now and how many seconds in it is, without having to resort to some centralized state management such as `Firebase` nor a decentralized one which would cost `ether` to run.

We are really proud over the professional look this project already has. 

## What We learned
Anything that is to be run over the network at a hackathon can be troublesome, due to possible IFI issues and low throughput.

Always keep the scope to a minimum to actually have something done, and be able to enjoy the ride, even though you of course will need to work through the nights.

## What's next for Jukeblox
Implementing voting on songs, banning of users, royalties of songs played.

A way for users to manage settings for how much a "quarter" is, the limit of song length accepted and the max length of the queue.

Putting the web client on Swarm/IPFS and connecting an `.eth` name to it, to finalize the decentralization.

Think about how we can scale `Jukeblox` from handling a few hundred songs to tens of thousands of songs, where indexing and searchability becomes a challenge because we don't want to store metadata any longer in the smart contract at that point.
