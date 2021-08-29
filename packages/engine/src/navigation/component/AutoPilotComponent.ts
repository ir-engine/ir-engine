import { Entity } from '../../ecs/classes/Entity'
import { Path } from 'yuka'
import { addComponent, createMappedComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { findPath } from '../systems/AutopilotSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Vector3 } from 'three'
import { NavMeshComponent } from './NavMeshComponent'
import { WorldScene } from '../../scene/functions/SceneLoading'

/**
 * @author xiani_zp <github.com/xiani>
 */

export type AutoPilotComponentType = {
  navEntity: Entity
  path: Path
}

export function createAutoPilotComponent(entity: Entity, x: number, y: number, z: number) {
  return addComponent(entity, AutoPilotComponent, {
    path: findPath(
      // TODO: is this right? was WorldScene.mapEid but that was removed
      getComponent(entity, NavMeshComponent).yukaNavMesh,
      getComponent(entity, TransformComponent).position,
      new Vector3(x, y, z),
      new Vector3(0, 0, 0)
    ),
    navEntity: null
  })
}

export const AutoPilotComponent = createMappedComponent<AutoPilotComponentType>()
