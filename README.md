<p align="center">
    <img src="./assets/alternatives/pride_transparent_500x500_lq.png" height="256" width="256" />
</p>
<p align="center">
  <img src="https://skillicons.dev/icons?i=next,tailwind,nest,rust,typescript,docker,kubernetes,graphql" />
  <br/>
  <a href="https://atlas.bot/support"><kbd>🔵 discord</kbd></a> <a href="https://atlas.bot"><kbd>🟣 website</kbd></a>
</p>

# atlas

> [!NOTE]
> Atlas is not and will never be self-hostable. If that's what you're here for, you're out of luck.

> [!WARNING]
> This repo is missing some parts of the bot, but over time most will be added.

A Discord bot to unlock your creativity and unify your community.

## how 

`pandora` connects to Discord and caches data from events, then dumps them into a nats queue. `bot` consumes those events and processes them. When the worker needs cached info, it talks to `pandora` over gRPC, in production through `eridium` so it can talk to the right `pandora` instance. When the worker needs to send data to Discord, it uses the `elpis` library which goes through a proxy service handling ratelimiting aross the whole bot.

The GraphQL API `api` for the dashboard `web` both talk to `pandora` over gRPC for cached data and in the future, some realtime capabiltiies.

libraries or services with links are open source. the rest are *currently* closed source, but may be open sourced in the future.

### services

- `api` - the GraphQL API for the dashboard
- `bot` - the worker service that consumes events from `pandora` and processes them using `elpis`
- `eridium` - a grpc proxy that takes requests from `bot` and sends them to the `pandora` instance that has the relevant cache
- `pandora` - the gateway service that connects to Discord and caches data
- `web` - the dashboard

### libraries

- [colour](./packages/colour) - colour utilities and presets
- [configs](./packages/configs) - eslint and tsconfig files
- [core](./packages/core) - reusable generic utilities used in many places, including the web
- [discord-utilities](./packages/discord-utilities) - utilities for Discord, closely tied to elpis but can run in browsers
- [emoji](./packages/emoji) - emoji sheets and utilities for dealing with ~~an abomination~~ emojis
- [parsers](./packages/parsers) - does this need an explanation? numbers, booleans, time - dealing with humans is hard.
- [razorback](./packages/razorback) - an experimental reimplementation of our scripting language `pella`
- `common` - [core](./packages/core) but specific to server-side code.
- `elpis` - wraps discords API and pulls from pandora for cached data instead of having its own cache. also handles ratelimiting through a proxy.
- `pella` - our custom scripting language.
- `logging` - wraps pino and makes it easier to reuse.

