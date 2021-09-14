# ECS GLTF Object Metadata

The gltf format and all threejs objects support userData / user properties, which can store arbitrary data as JSON. This can enable interop and usage of data outside of the xrengine ecosystem.


Model userData properties

```ts
{
  [realitypack.entity]: name
  [realitypack.prefab-type.property]: value
  [realitypack.component-type.property]: value
}
```

Golf holes example

```ts
{
  "realitypack.entity": “GolfHole-0"
  "realitypack.box-collider.isTrigger": true
  "realitypack.CustomComponent.value": 12345
}
```

would result in an entity with components

NameComponent { name: "GolfHole-0" }
TransformComponent { position, rotation, scale } (from mesh relative to world origin)
Object3DComponent { value: (the mesh this was loaded from) }
ColliderComponent { body: (a physics trigger box body) }
CustomComponent: { value: 12345 }