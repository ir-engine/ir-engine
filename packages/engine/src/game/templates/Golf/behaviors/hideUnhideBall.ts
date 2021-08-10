import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../../../scene/components/Object3DComponent'
import { GolfState } from '../GolfGameComponents'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const hideBall = (entity: Entity): void => {
  const object3D = getComponent(entity, Object3DComponent)?.value
  if (object3D === undefined) return
  object3D.visible = false
}

export const unhideBall = (entity: Entity): void => {
  const object3D = getComponent(entity, Object3DComponent)?.value
  if (object3D === undefined) return
  object3D.visible = true
  //console.log('unhideBall', object3D)
}

export const applyHideOrVisibleState = (entity: Entity): void => {
  const object3D = getComponent(entity, Object3DComponent)?.value
  if (object3D === undefined) return
  if (hasComponent(entity, GolfState.BallVisible)) {
    unhideBall(entity)
  } else if (hasComponent(entity, GolfState.BallHidden)) {
    hideBall(entity)
  }
}
