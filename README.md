![IR-engine-black-square](https://github.com/user-attachments/assets/0f6fbf86-20ff-40b2-8524-5d93ff8b6ab8)

>  Manifest your dreams on the open social spatial web.

## Background

https://user-images.githubusercontent.com/507127/142818955-51d7757f-a432-45da-8f8f-56037358ad58.mp4

We ([Infinite Reality Engine](https://github.com/ir-engine)) believe that the Metaverse, 
Web AR, VR, and XR should be easy.

We want a Star Trek future where participating in immersive communication 
technology and shared simulations should be as easy and natural as making a website.

- Includes a self-deployable platform, UI, worlds, avatars, and games
- Fully customizable for any kind of game, social experience, event or spatial web site
- Social features like avatars, chat, groups, friends, blocking and moderation
- Complete world editing and administration
- 2D, 3D and XR Avatars with full inverse kinematics and facial expressions
- Fully networked physics using Rapier Physics
- Voice and video over WebRTC server & peer-to-peer
- Instant login and location sharing with phone number or email
- Modular- Use the engine, server, client, editor and scalable devops infrastructure as needed
- OAuth login with Meta, Apple, X, Google, Github or instant login with email or phone
- WebGL client deployable to iOS, Android and desktop
- Free, open source, CPAL licensed

## Project API

### [Library of IR Engine Projects](https://github.com/ir-engine/project-manifest)

Create composable plug-ins for iR Engine experiences with the plugin system (Projects API)

## Launch iR Engine with Control Center Install

### [Use iR Engine Launcher GUI](https://github.com/ir-engine/ir-engine-launcher)

Best for simple self hosting.

## Advanced Development Install

### Pre-Requisites

To install iR Engine locally, the following pre-reqs are required.

* Linux (many of us develop on Ubuntu), Mac OS X, or Windows (we recommend WSL2)
* Node.js v18 or later (we recommend installing via [`nvm`](https://github.com/nvm-sh/nvm)
  or [`asdf`](https://github.com/asdf-vm/asdf).)
* C++ (for `node-gyp`), Python >=3.6 + [PIP](https://pypi.org/project/pip/), `make`
  and other build tools, for compiling Mediasoup.
  Although most of iR Engine is written in TypeScript, it uses a [Mediasoup](https://mediasoup.org/)
  engine for WebRTC conferencing. See the [Mediasoup install instructions](https://mediasoup.org/documentation/v3/mediasoup/installation/)
  for more details.
* Docker. (Although Docker is technically optional, running iR Engine requires starting up
  half a dozen different services, and using Docker Compose will make your life dramatically
  easier.)
* MariaDB and Redis. (If you're using Docker, containers for MariaDB and Redis 
  will automatically be started up.)

### Getting Started

See the [Installation instructions](https://app.archbee.com/public/PREVIEW-G_Kn_XtWasJmPy3-KJn4x)
for more details.

## Usage

### Documentation

[WIP Aug 30, 2024]

## Contributing

* We expect contributors and community members to follow our
  [Code of Conduct](CODE_OF_CONDUCT.md).
* See the **[Contributing Guide](CONTRIBUTING.md)** and corresponding
  [wiki entry](https://github.com/ir-engine/ir-engine/wiki/Testing-&-Contributing)
  for more details.
* Version numbering of the iR Engine monorepo follows the
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

![msf-member-badge-small](https://user-images.githubusercontent.com/5104160/181168132-57a91f8b-16c9-45f0-a0ee-c89f8f018a80.png)

### [Join our Discord](https://discord.gg/xrf)  [![Discord Chat](https://img.shields.io/discord/692672143053422678.svg)](https://discord.gg/xrf)

## License
[CPAL](LICENSE) - Copyright (c) 2021-2024 Infinite Reality.
iR Engine, formerly known as Ethereal Engine and XREngine

If you wish to use iR Engine under the open-source CPAL license, attribution is required. 
Please see attribution guidelines in the [LICENSE](LICENSE) file.
Other licensing options are available, please contact us for more information.

[Release History and Author Archive](/HISTORY.md)
