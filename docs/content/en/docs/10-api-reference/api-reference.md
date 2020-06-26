---
title: "Parameter Reference"
linkTitle: "Parameter Reference"
date: 2017-01-05
description: >
  Type Reference
---

{{% pageinfo %}}
API Reference for XRChat
{{% /pageinfo %}}
XRChat has a flexible typing system, so that new types can be added and automatically seeded into the database.

Following the standardized patterns of Feathersjs and Rails-style MVCs in general, all of our low level APIs are available to admins to List and CRUD manually. We wrap these low-level APIs with high-level APIs to manage lots of complexity in a single endpoint -- for example, the /upload endpoint will manage creating resources (a video and thumbnail subresource), relate them together and assign ownership, attribution and license properties.

XRChat tries to reflect the entity component system on the frontend inside of the database. We have four base objects:

## Low level object APIs

### Entity
This is a unique ID that serves as a key for relating components together. Entities have no functionality on their own, but gain functional aspects from attached components.

Entities have a default type of "default", which means they have no inherited properties. For primitive types (an a-box in Aframe, for example) entities have a type relating to the primiting (in this case the type would be 'box')

### Component
Components reflect Aframe standard or custom components. Components in the database store data statefully, and components are always associated with entities -- when an entity is destroyed, all components go along with it.

### Resource
Resources are referenced files -- a video, image, thumbnail, script, anycd ..
thing that can be discovered at a URL

### Collection
Collections represent a logic grouping of entities. A "scene" is a collection of entities with the scene type. Collections can also contain information about attribution and licensing (for example, for a scene)