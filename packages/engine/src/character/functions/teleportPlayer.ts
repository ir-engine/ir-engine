import { Euler, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { CharacterComponent } from '../components/CharacterComponent'
import { ControllerColliderComponent } from '../components/ControllerColliderComponent'
import { rotateViewVectorXZ } from '../../camera/systems/CameraSystem'

export const teleportPlayer = (playerEntity: Entity, position: Vector3, rotation: Quaternion): void => {
  const controller = getMutableComponent(playerEntity, ControllerColliderComponent)
  const actor = getMutableComponent(playerEntity, CharacterComponent)

  if (!(rotation instanceof Quaternion)) {
    rotation = new Quaternion((rotation as any).x, (rotation as any).y, (rotation as any).z, (rotation as any).w)
  }

  const pos = new Vector3(position.x, position.y, position.z)
  pos.y += actor.actorHalfHeight
  controller.controller.updateTransform({
    translation: pos,
    rotation
  })

  const euler = new Euler().setFromQuaternion(rotation)
  rotateViewVectorXZ(actor.viewVector, euler.y)
  controller.controller.velocity.setScalar(0)
}
