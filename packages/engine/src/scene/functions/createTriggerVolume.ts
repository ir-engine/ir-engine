import { BoxBufferGeometry, BoxHelper, Material, Mesh } from 'three'
import { ShapeType, SHAPES, Body, BodyType, Transform, PhysXInstance } from 'three-physx'
import { Engine } from '../../ecs/classes/Engine'

import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'
import { addObject3DComponent } from './addObject3DComponent'

export const createTriggerVolume = (entity, args) => {
  console.log('args are', args)

  const transform = getComponent(entity, TransformComponent)
  const pos = transform.position ?? { x: 0, y: 0, z: 0 }
  const rot = transform.rotation ?? { x: 0, y: 0, z: 0, w: 1 }
  const scale = transform.scale ?? { x: 1, y: 1, z: 1 }

  if (args.showHelper) {
    // A visual representation for the trigger
    const geometry = new BoxBufferGeometry()
    const material = new Material()
    const boxMesh = new Mesh(geometry, material)
    boxMesh.position.set(pos.x, pos.y, pos.z)
    boxMesh.scale.set(scale.x, scale.y, scale.z)
    const box = new BoxHelper(boxMesh, 0xffff00)
    box.layers.set(1)
    addObject3DComponent(entity, box, {})
  }

  const shapeBox: ShapeType = {
    shape: SHAPES.Box,
    options: { boxExtents: { x: scale.x / 2, y: scale.y / 2, z: scale.z / 2 } },
    config: {
      isTrigger: true,
      collisionLayer: CollisionGroups.Trigger,
      collisionMask: CollisionGroups.Avatars
    }
  }

  const body = new Body({
    shapes: [shapeBox],
    type: BodyType.STATIC,
    transform: new Transform({
      translation: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w }
    })
  })

  body.userData = { entity }
  PhysXInstance.instance.addBody(body)

  addComponent(entity, ColliderComponent, { body })

  const triggerVolume = addComponent(entity, TriggerVolumeComponent, {
    args: args,
    target: args.target,
    active: false
  })
}
