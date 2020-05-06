---
title: "Parameter Reference"
linkTitle: "Parameter Reference"
date: 2017-01-05
description: >
  Type Reference
---

{{% pageinfo %}}
API Type Reference for XRChat
{{% /pageinfo %}}
XRChat has a flexible typing system, so that new types can be added and automatically seeded into the database.

## Resource Types
Resources are references to anything that's statically stored in our volume file storage (i.e S3)
Resource types all us to filter queries and give us understanding in how to handle embedded metadata.

**Resource Types**
thumbnail
image
video
script
model3d
shader
data

## Entity Type
Entities are default entity type unless assigned a specific type. An entity 'type' allows an entity to appear as an Aframe primitive or custom high level entity type.

**Entity Types**
default -- empty entity, ready for components to be added
grid -- custom entity for our grid display
box
camera
circle
cone
cursor
curvedimage
cylinder
dodecahedron
gltf-model
icosahedron
image
light
link
obj-model
octahdreon
plane
ring
sky
sound
sphere
tetrahedron
text
torus-knot
torus
triangle
video
videosphere

## Collection Type
Collections define a related set of entities, e.g. a scene, shop inventory or 3D model composited from submodels

**Collection Types**
default -- generic collection with no owner or attribution necessary
scene
inventory

## Component Type
Components are modular aspects that can be added to entities to give the entity functionaly. Component types directly mirror Aframe components and allow us to query by type, entity or both.

**Component Types**
animation
background
camera
cursor
debug
device-orientation-permission-ui
embedded
fog
geometry
gltf-model
hand-controls
keyboard-shortcuts
laser-controls
light
line
link
loading-screen
look-controls
obj-model
oculus-go-controls
pool
position
raycaster
renderer
rotation
scale
screenshot
shadow
sound
stats
text
tracked-controls
visible
vive-controls
vive-focus-controls
vr-mode-ui
wasd-controls
windows-motion-controls
networked -- networked aframe
grid -- custom grid display componentZ

## Relationship Type
Relationships define how users are connected to each other
**Relationship Types**
null -- users are not connected
friend -- user has expressed interest in being friends with other user
notfriend -- user has explicitly turned down friend request
blocked -- user has decided to block the other user