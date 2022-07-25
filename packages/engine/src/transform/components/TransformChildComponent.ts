import { Quaternion, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { addComponent, createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformOffsetComponentType = {
  referenceEntity: Entity
  depth: number
  offsetPosition: Vector3
  offsetRotation: Quaternion
}

export const TransformOffsetComponent = createMappedComponent<TransformOffsetComponentType>('TransformOffsetComponent')

export function addTransformOffsetComponent(
  entity: Entity,
  referenceEntity: Entity,
  world: World = Engine.instance.currentWorld
) {
  return addComponent(
    entity,
    TransformOffsetComponent,
    {
      referenceEntity,
      depth: 0,
      offsetPosition: new Vector3(),
      offsetRotation: new Quaternion()
    },
    world
  )
}
