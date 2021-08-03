import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getMutableComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../../../scene/components/Object3DComponent'
import { GolfState } from '../GolfGameComponents'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const hideBall: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  const object3D = getMutableComponent(entity, Object3DComponent)?.value
  if (object3D === undefined) return
  object3D.visible = false
  // console.log('hideBall', object3D)
}

export const unhideBall: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  const object3D = getMutableComponent(entity, Object3DComponent)?.value
  if (object3D === undefined) return
  object3D.visible = true
  //console.log('unhideBall', object3D)
}

export const applyHideOrVisibleState: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  const object3D = getMutableComponent(entity, Object3DComponent)?.value
  if (object3D === undefined) return
  if (hasComponent(entity, GolfState.BallVisible)) {
    unhideBall(entity)
  } else if (hasComponent(entity, GolfState.BallHidden)) {
    hideBall(entity)
  }
}
