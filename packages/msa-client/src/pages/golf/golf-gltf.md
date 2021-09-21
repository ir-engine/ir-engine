# PuttClub


## Object Metadata

All golf tees and holes are loaded from the gltf model scene, to enable changes to the course layout be reflected automatically with the physics colliders.

Tees and holes require the following properties:

```
realitypack.entity: 'GolfTee-0'
realitypack.userdata.par: 3
```

```
realitypack.entity: 'GolfHole-0'
realitypack.box-collider.isTrigger: true
realitypack.box-collider.removeMesh: true
```


where `GolfHole-0` is the golf hole collider for the first hole of the course. These properties must have the correct casing, the dash and the number that corresponds to the number of the hole (starting at index 0, so the 18th hole would have number 17), or they will not work.