# atlas

<p align="center">
    <img src="./assets/alternatives/pride_transparent_500x500_lq.png" height="256" width="256" />
</p>

> **Note**
> Atlas is not and will never be self-hostable. If that's what you're here for, you're out of luck.

> **Warning**
> This repo is not the full source code, and is missing important parts. In the future, those parts may be added to this repo, but there are no plans at the moment to publish everything required to run your own instance.

A Discord bot to unlock your creativity and unify your community.

## how atlas works

A gateway service `pandora` connects to Discord and caches data from events, then dumps them into a nats queue. A worker service `bot` consumes those events and processes them. When the worker needs cached info, it talks to `pandora` over gRPC. When the worker needs to send data to Discord, it goes through a proxy service which handles ratelimiting aross the whole bot. 

The GraphQL API `api` for the dashboard `web` both talk to `pandora` over gRPC for cached data and in the future, some realtime capabiltiies.
