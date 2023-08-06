<p align="center">
    <img src="./assets/alternatives/pride_transparent_500x500_lq.png" height="256" width="256" />
</p>

# atlas

> **Note**
> Atlas is not and will never be self-hostable. If that's what you're here for, you're out of luck.

> **Warning**
> This repo is missing some parts of the bot, but over time most will be added.

A Discord bot to unlock your creativity and unify your community.

## requirements

Linux is _required_. Use WSL if you're on Windows.

- [docker](https://docs.docker.com/engine/install/ubuntu/)
- [rust](https://www.rust-lang.org/tools/install)
- [node.js lts](https://nodejs.org/en)
  - [volta](https://volta.sh/) is by far the best way to install node.js
  - [pnpm](https://pnpm.io/installation) is necessary, use it in place of `npm`/`yarn`.
- `build-essential` for native modules

## how atlas works

A gateway service `pandora` connects to Discord and caches data from events, then dumps them into a nats queue. A worker service `bot` consumes those events and processes them. When the worker needs cached info, it talks to `pandora` over gRPC. When the worker needs to send data to Discord, it goes through a proxy service which handles ratelimiting aross the whole bot.

The GraphQL API `api` for the dashboard `web` both talk to `pandora` over gRPC for cached data and in the future, some realtime capabiltiies.
