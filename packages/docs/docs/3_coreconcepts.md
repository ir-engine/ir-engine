---
id: coreconcepts
title: Core Concepts
---

## Where should I start?

XREngine is, at it's core, a set of interoperable packages, which are in turn built on popular web frameworks and the Node.js ecosystem.

It can be very daunting for developers new to our ecosystem to know where to start, or what they even need to know to get started. We recommend you start by reading a bit about the underlying dependencies first, so that when you dive into the code you aren't overwhelmed with trying to understand and map so many foreign concepts at the same time. You can read about dependencies in the ARCHITECTURE section.

Our decision for one design concept or framework over another was largely driven by a desire to reach as many people as possible while staying current to emerging ecosystem trends. We want developers to see our engine as an opportunity to build highly relevant skills, and we have tried to incorporate popular solutions wherever writing our own wasn't necessary. You may not agree with some of our framework decisions. Just know that we are driven not by a love for one framework or another, but a desire to minimize the learning curve for the most people coming to this engine for the first time. The engine is designed in a modular way, however, so you are free to pick and choose the parts the work for you and modify what doesn't.

# Monorepo and Packages

## Yarn, Lerna and the NPM Ecosystem

## Modularity

TODO

# Engine

TODO

## Entity Component System

Our engine is built around an ECS paradigm based on ECSY by Fernando Serrano and Robert Long (and contributions by others). We have altered the API slightly to reflect a more functional approach, removed and simplified other parts and converted the code to native Typescript.

Our ECS implementation is available here:
- https://github.com/XRFoundation/XREngine/tree/dev/packages/engine/src/ecs

You can watch a very helpful overview of entity component systems here:
- https://www.youtube.com/watch?v=2rW7ALyHaas
- https://www.youtube.com/watch?v=Z-CILn2w9K0

ECSY docs cover most of the key concepts of our engine.
https://ecsy.io/docs/

# Client

TODO

# API Server

TODO

## Login and Authentication

TODO

## REST and Communication

TODO

# Game Server

TODO

## Server-Authority

XREngine is primarily a server authoratative architecture and network model. Long term, we hope to introduce P2P networking layers, and of course you can build applications that can run as both the client *and* the server if you target a native application (which we support through Capacitor and Electron). A good comparison is Minecraft -- most Minecraft users playing on large social servers are connecting to a single endpoint that breaks them out into one of many smaller servers. Admins can request actions of the server -- to kick a user, for example -- but the server has ultimate authority over all decisions in the world. This makes it much harder for users to hack other users or generally hack a network that has no server authority. As we imagine a large, interconnected network of servers and clusters of servers, we hope we can strike a balance between open network interoperability and letting individual developers and server owners govern users as they see fit.

While is is in the Unity Engine, this tutorial does a good job of explaining server authority:
https://www.youtube.com/watch?v=6n4SDOmizOo

## Scalability

XREngine is designed to scale "horizontally", as opposed to "vertically". Instead of running massive servers hosting massive worlds, we spin up small, identical instances of worlds to accomodate new groups of users once we've hit capacity in the existing servers. The instances exist for as long as people are in them, and are removed once everyone leaves. A good comparison is Fortnite -- one hundred people jump into a world to have an event, and a new game server is allocated for them. They play, they finish, the gameserver instance is destroyed.

To accomodate large scale MMO worlds we need to either build a network of portals -- as of writing, we have eight worlds connected this way by portals -- or stitch servers together so that users travelling over world boundaries or into populated areas can be handed off between servers as part of a larger, shared, universal state. In either case we can set heuristics to instance any given location if many people arrive. The bottleneck for most devices is how many skinned mesh avatars they can render at a time, and on the server it's how many WebRTC feeds we can pipe through. Our belief is that the "Fortnite" model (large fleets of flexible, recyclable game server instances) can be abstracted well into the largescale MMO case.

Under the hood, we are using a game server fleet management tool called Agones, which leverages the power of Kubernetes to spin up new pods running game server instances. One benefit of this architecture is that the game server can be built in anything -- Unity, Unreal, golang, etc. We provide a ready-made game server in Node.js already integrated for virtual worlds, but you're free to modify this however you want.

Pods? Game servers? Kubernetes? Yes, there's a lot there. If you're interested in the scalable deployment and infrastructure, this is covered in more detail in the ARCHITECTURE section.

For everyone else, well, we've spent a lot of effort building the core stack to include a "just works" architecture. If you are just starting out and using our whole multiplayer stack then we recommend leaving the scalability to us until you feel comfortable with the rest of the architecture.

## Cross-Platform

While XREngine is built using popular web technologies and should work in all popular browsers, we've added some examples for building to iOS, Android and Electron without having to change a single line of code in your application. For more information on how this works, please consult the ARCHITECTURE section. For build instructions, consult the DEPLOYMENT section.
