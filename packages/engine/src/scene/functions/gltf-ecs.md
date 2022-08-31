# ECS GLTF Object Metadata

The gltf format and all threejs objects support userData / user properties, which can store arbitrary data as JSON. This can enable interop and usage of data outside of the xrengine ecosystem.


Model userData properties

```ts
{
  [xrengine.entity]: name
  [xrengine.prefab-type.property]: value
  [xrengine.ComponentName.property]: value
}
```

Example

```ts
{
  "xrengine.entity": "MyTrigger"
  "xrengine.collider.isTrigger": true
  "xrengine.CustomComponent.value": 12345
}
```

would result in an entity with components

NameComponent { name: "MyTrigger" }
TransformComponent { position, rotation, scale } (from mesh relative to world origin)
Object3DComponent { value: (the mesh this was loaded from) }
RigidBodyComponent { body: (a physics trigger box body) }
ColliderComponent { isTrigger: true, ... }
CustomComponent: { value: 12345 }
