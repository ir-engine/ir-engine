# Ethereal Engine _(XREngine)_

![Ethereal Engine logo](https://user-images.githubusercontent.com/5104160/181167947-2cf42b34-7dd6-4e71-b840-c25b8cf850e6.png)

>  Manifest your dreams on the open social spatial web.

## Table of Contents

- [Background](#background)
  - [Demos](#demos)
- [Install](#advanced-development-install)
  - [Pre-Requisites](#pre-requisites)
  - [Getting Started](#getting-started)
- [XRE XRModule](#xre-xrmodule)
- [Usage](#usage)
- [Contributing](#contributing)
  - [Let's build it together](#lets-build-it-together)
- [License](#license)
- [Releases](https://github.com/XRFoundation/XREngine/releases)
- [Roadmap](/ROADMAP.md)

## Background

https://user-images.githubusercontent.com/507127/142818955-51d7757f-a432-45da-8f8f-56037358ad58.mp4

We ([Ethereal Engine](https://github.com/xrfoundation)) believe that the Metaverse, 
Web AR, VR, and XR should be easy.

We want a Star Trek future where participating in immersive communication 
technology and shared simulations should be as easy and natural as making a website.

- Includes a self-deployable platform, UI, worlds, avatars, and games
- Fully customizable for any kind of game, social experience, event or spatial web app
- User management, avatars and inventory with optional blockchain integration (see our Blockchain-in-a-Box repo)
- Social features like chat, groups, friends, blocking and moderation
- Complete world editing and administration
- 2D, 3D and XR Avatars with full inverse kinematics and facial expressions
- Fully networked physics using Rapier Physics
- Voice and video over WebRTC
- Instant login and location sharing with phone number or email
- Modular- Use the engine, server, client, editor and scalable devops infrastructure as needed
- OAuth login with Facebook, Google, Steam, Github or instant login with email or phone
- WebGL client deployable to iOS, Android and desktop
- Free, open source, MIT and Apache 2.0-licensed

## Demos

Guest Demos

- ***[Apartment - CCO from Sketchfab](https://app.etherealengine.com/location/apartment)***
- ***[Star Station - our dev coommunity hangout](https://app.etherealengine.com/location/sky-station)***
- ***[Globe Concert Hall - collab with WildCapture.io](https://app.etherealengine.com/location/globe-theater)***


Host Demos 

- [Admin Console - Demo Cluster - Request Demo Access on our Discord](https://demo.etherealengine.com/admin)
- [XRModule Asset Editor - Demo Cluster - Request Demo Access on our Discord](https://demo.etherealengine.com/editor)

## XRModule

### [Library of XRModules](https://github.com/XRFoundation?q=xre-project)

Create composable plug-ins for Ethereal Engine scenes with XRModule Projects

### [Create XRModule Projects](https://xrfoundation.github.io/ethereal-engine-docs/docs/concepts/projects_api)

XRModules are folders that contain all your custom code, assets and scenes. They are version controlled using git & github, and can be installed to any deployment with a single click. (more on that in the next chapter)

Pictured below is an example of 4 projects installed. By default, only the default-project is installed, which in a production environment is read only. You can find the default project under /packages/projects/default-project/

In a production environment, the builder process will install all projects according to the project database table and will download files from the storage provider. In a local development environment, the local file system is always the source of truth. Any project folders added or removed from the file system will be automatically added or removed from the database. This is to ensure there is no accidental loss of data, as these project folders are all git repositories.

## Launch Ethereal Engine with Control Center Install - ***RECOMMENDED***

### [Use Metaverse Control Plane Managment GUI](https://github.com/XRFoundation/XREngine-Control-Center)

Best for simple self hosting, advanced editor content creation, and XRProject Pack Project development.

## Advanced Development Install

### Pre-Requisites

To install Ethereal Engine locally, the following pre-reqs are required.

* Linux (many of us develop on Ubuntu), Mac OS X, or Windows (we recommend WSL2)
* Node.js v16 or later (we recommend installing via [`nvm`](https://github.com/nvm-sh/nvm)
  or [`asdf`](https://github.com/asdf-vm/asdf).)
* C++ (for `node-gyp`), Python >=3.6 + [PIP](https://pypi.org/project/pip/), `make`
  and other build tools, for compiling Mediasoup.
  Although most of Ethereal Engine is written in TypeScript, it uses a [Mediasoup](https://mediasoup.org/)
  engine for WebRTC conferencing. See the [Mediasoup install instructions](https://mediasoup.org/documentation/v3/mediasoup/installation/)
  for more details.
* Docker. (Although Docker is technically optional, running Ethereal Engine requires starting up
  half a dozen different services, and using Docker Compose will make your life dramatically
  easier.)
* MariaDB and Redis. (If you're using Docker, containers for MariaDB and Redis 
  will automatically be started up.)

### Getting Started

See the [Installation instructions](https://xrfoundation.github.io/ethereal-engine-docs/docs/installation/)
for more details.

## Usage

### Documentation

* [General Ethereal Engine documentation](https://xrfoundation.github.io/ethereal-engine-docs/docs)
* [Auto-generated (tsdoc) API reference](https://xrfoundation.github.io/ethereal-engine-docs/docs/generated/common/)
* [Avatar, Scene & Asset Pipeline](https://github.com/XRFoundation/XREngine/wiki/Avatar,-Scene-&-Asset-Pipeline)
* [Why are we building Ethereal Engine?](https://xrfoundation.github.io/ethereal-engine-docs/docs/)

## Contributing

* We expect contributors and community members to follow our
  [Code of Conduct](CODE_OF_CONDUCT.md).
* See the **[Contributing Guide](CONTRIBUTING.md)** and corresponding
  [wiki entry](https://github.com/XRFoundation/XREngine/wiki/Contributing)
  for more details.
* Version numbering of the Ethereal Engine monorepo follows the
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

### [Sponsorship](https://opencollective.com/etherealengine) [![Open Collective](https://opencollective.com/etherealengine/tiers/badge.svg)](https://opencollective.com/etherealengine)

## License
[MIT](LICENSE) - Copyright (c) 2020-2022 Ethereal Engine team, formerly known as XREngine by XR Foundation


[Release History and Author Archive](/HISTORY.md)
