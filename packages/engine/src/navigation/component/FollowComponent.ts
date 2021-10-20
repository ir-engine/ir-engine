import { Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import {
  createMappedComponent,
  hasComponent,
  addComponent,
  getComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { AutoPilotComponent } from './AutoPilotComponent'
import { AutoPilotRequestComponent } from './AutoPilotRequestComponent'

export type FollowComponentType = {
  targetEid: Entity
  cStep: number
  prevTarget: Vector3
}

export const createFollowComponent = (eid: Entity, targetEid: Entity) => {
  //check if has component, if so update earlier (after the bitecs bug)
  return addComponent(eid, FollowComponent, {
    targetEid: targetEid,
    cStep: 0,
    prevTarget: new Vector3(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
  })
}
export const removeFollowComponent = (eid: Entity): void => {
  if (hasComponent(eid, FollowComponent)) {
    removeComponent(eid, FollowComponent)
    removeComponent(eid, AutoPilotRequestComponent)
    removeComponent(eid, AutoPilotComponent)
  }
}

export const FollowComponent = createMappedComponent<FollowComponentType>('FollowComponent')
