import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformOffsetComponentType = {
  referenceEntity: Entity
  depth: number
  offsetPosition: Vector3
  offsetRotation: Quaternion
}

export const TransformOffsetComponent = createMappedComponent<TransformOffsetComponentType>('TransformOffsetComponent')

export function addTransformOffsetComponent(entity: Entity, referenceEntity: Entity) {
  let ref: Entity
  const transformOffset = addComponent(entity, TransformOffsetComponent, {
    get referenceEntity() {
      return ref
    },
    set referenceEntity(v) {
      ref = v
      getState(EngineState).transformOffsetsNeedSorting.set(true)
    },
    depth: 0,
    offsetPosition: new Vector3(),
    offsetRotation: new Quaternion()
  })
  transformOffset.referenceEntity = referenceEntity
  return transformOffset
}
