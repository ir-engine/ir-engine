import { Vector3 } from 'three'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { findInterpolationSnapshot } from '@xrengine/engine/src/physics/functions/findInterpolationSnapshot'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const teleportObject = (entity: Entity, position?: any): void => {
  const velocity = getComponent(entity, VelocityComponent)
  const collider = getComponent(entity, ColliderComponent)

  velocity.velocity.set(0, 0, 0)

  collider.body.setLinearDamping(0.1)
  collider.body.setAngularDamping(0.1)

  collider.body.updateTransform({
    translation: {
      x: position.x,
      y: position.y + 0.5,
      z: position.z
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1
    },
    linearVelocity: {
      x: 0,
      y: 0,
      z: 0
    }
  })

  collider.body.setLinearVelocity(new Vector3(), true)
  collider.body.setAngularVelocity(new Vector3(), true)
}

export const removeVelocity = (entity: Entity): void => {
  console.log(' --- removeVelocity')
  const collider = getComponent(entity, ColliderComponent)
  if (!collider) return
  collider.body.setLinearDamping(10)
  collider.body.setAngularDamping(10)
}

export const updateColliderPosition = (entity: Entity): void => {
  console.log('CORRECT BALL FROM SERVER')

  const collider = getComponent(entity, ColliderComponent)
  const currentSnapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)
  if (currentSnapshot === undefined || collider === undefined) return

  collider?.body.updateTransform({
    translation: {
      x: currentSnapshot.x,
      y: currentSnapshot.y,
      z: currentSnapshot.z
    },
    rotation: {
      x: currentSnapshot.qX,
      y: currentSnapshot.qY,
      z: currentSnapshot.qZ,
      w: currentSnapshot.qW
    }
  })
}
