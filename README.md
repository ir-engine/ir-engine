# XR Engine _(xrengine)_

![xrengine black](https://user-images.githubusercontent.com/5104160/142821267-7e131891-0caa-496b-9cda-a82dee8a04b6.png)

> Your own sandbox in the Metaverse. Take what you need, or launch the full stack.

## Table of Contents

- [Background](#background)
  - [Demo](#demo)
- [Install](#install)
  - [Pre-Requisites](#pre-requisites)
  - [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
  - [Let's build it together](#lets-build-it-together)
- [License](#license)
- [Releases](https://github.com/XRFoundation/XREngine/releases)
- [Roadmap](/ROADMAP.md)

## Background

https://user-images.githubusercontent.com/507127/142818955-51d7757f-a432-45da-8f8f-56037358ad58.mp4

We ([XR Foundation](https://github.com/xrfoundation)) believe that the Metaverse, 
Web AR, VR, and XR should be easy.

We want a Star Trek future where participating in immersive communication 
technology and shared simulations should be as easy and natural as making a website.

- Includes a self-deployable platform, UI, worlds, avatars, and games
- Fully customizable for any kind of game, social experience, event or spatial web app
- User management, avatars and inventory with optional blockchain integration (see our Blockchain-in-a-Box repo)
- Social features like chat, groups, friends, blocking and moderation
- Complete world editing and administration
- 2D, 3D and XR Avatars with full inverse kinematics and facial expressions
- Fully networked physics using PhysX compiled to wasm
- Voice and video over WebRTC
- Instant login and location sharing with phone number or email
- Modular- Use the engine, server, client, editor and scalable devops infrastructure as needed
- OAuth login with Facebook, Google, Steam, Github or instant login with email or phone
- WebGL client deployable to iOS, Android and desktop
- Free, open source, MIT and Apache 2.0-licensed

### Demo

We have better demos coming, but for now you can jump around this CC0 apartment 
we got from Sketchfab:
https://app.theoverlay.io/location/apartment

## Install

### Pre-Requisites

To install XREngine locally, the following pre-reqs are required.

* Linux (many of us develop on Ubuntu), Mac OS X, or Windows (we recommend WSL2)
* Node.js v16 or later (we recommend installing via [`nvm`](https://github.com/nvm-sh/nvm)
  or [`asdf`](https://github.com/asdf-vm/asdf).)
* C++ (for `node-gyp`), Python >=3.6 + [PIP](https://pypi.org/project/pip/), `make`
  and other build tools, for compiling Mediasoup.
  Although most of XREngine is written in TypeScript, it uses a [Mediasoup](https://mediasoup.org/)
  engine for WebRTC conferencing. See the [Mediasoup install instructions](https://mediasoup.org/documentation/v3/mediasoup/installation/)
  for more details.
* Docker. (Although Docker is technically optional, running XREngine requires starting up
  half a dozen different services, and using Docker Compose will make your life dramatically
  easier.)
* MariaDB and Redis. (If you're using Docker, containers for MariaDB and Redis 
  will automatically be started up.)

### Getting Started

See the [Installation instructions](/docs/docs/0_installation/readme.md)
for more details.

## Usage

### Documentation

* [General XREngine documentation](https://xrfoundation.github.io/xrengine-docs/docs)
* [Auto-generated (tsdoc) API reference](https://xrfoundation.github.io/xrengine-docs/docs/generated/common/)
* [Avatar, Scene & Asset Pipeline](https://github.com/XRFoundation/XREngine/wiki/Avatar,-Scene-&-Asset-Pipeline)
* [Why are we building XREngine?](/docs/docs/0_start-here.md)

## Contributing

* We expect contributors and community members to follow our
  [Code of Conduct](CODE_OF_CONDUCT.md).
* See the **[Contributing Guide](CONTRIBUTING.md)** and corresponding
  [wiki entry](https://github.com/XRFoundation/XREngine/wiki/Contributing)
  for more details.
* Version numbering of the XREngine monorepo follows the
  [Semantic versioning](http://semver.org/) approach.
* We use the [Prettier.io](https://prettier.io/) formatter for our code style.
* [Standard Readme](https://github.com/RichardLitt/standard-readme) for
  the README structure.

### Let's build it together

We believe that projects like this are extremely complex and difficult, and can 
only be built when large groups of people work together, out in the open. If you 
believe that your calling is to build a free, open network that everyone, 
everywhere can get value from, then you are welcome in our community, and we'll 
do our best to get you set up.

We are always hiring talented people who want to be leaders in what is to come. 
Inquire with anyone who seems like they know what's going on and they'll help 
you find who you need to talk to.

### [Join our Discord](https://discord.gg/xrf)  [![Discord Chat](https://img.shields.io/discord/692672143053422678.svg)](https://discord.gg/xrf)

### [Sponsorship](https://opencollective.com/xrfoundation) [![Open Collective](https://opencollective.com/xrfoundation/tiers/badge.svg)](https://opencollective.com/xrfoundation)

## License
[MIT](LICENSE) - Copyright (c) 2021-2022 XRFoundation


[Archive](/HISTORY.md)
