# Architecture Overview

This repository serves a few functions. 

## XREngine
Primarily, it acts a full stack deployment environment. The engine itself is the heart of XREngine, using libraries such as [threejs](https://threejs.org/), [bitecs](https://github.com/NateTheGreatt/bitECS), [ethereal.js](https://github.com/aelatgt/ethereal), [PhysX](https://github.com/NVIDIAGameWorks/PhysX) and [Mediasoup WebRTC](https://github.com/versatica/mediasoup) to enables robust MMO XR experience that rivals AAA quality and speed.

## XREditor
The XREditor sits on top of the engine, as a heavily modified version of [Mozilla Hubs' Spoke editor](https://hubs.mozilla.com/spoke). We are right in the middle of a comprehensive refactor of the editor to integrate it fully with the engine to enable immersive scene manipulation in real time.

## Docker/Kubernetes Instance Scaling
-


# Packages
## analytics
## client
 - default spatial social web UX
## client-core
 - User Profile Dialogs
 - Client Settings Drawer
 - Social Chat Drawers
 - Interaction Modals
## common
## editor
 - Projects UI
 - Scene Editor
## engine
 - Render / Post Processing
 - Physics
 - Spatial Audio
 - Asset System
 - Behavior Systems
 - Avatars
 - Computer Vision (CV)
 - Immersive XR (AR/VR)
 - XR3 Capture
## gameserver
## matchmaking
## ops
## projects
## server
 - Communication
 - Social Multiplayer
 - Administration
## server-core
## social

![](./images/02-repo-hierarchy.png)
