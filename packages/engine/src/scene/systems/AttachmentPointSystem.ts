import { Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AttachmentPointComponent } from '../components/AttachmentPointComponent'

const execute = () => {
  const attachmentPointQuery = defineQuery([AttachmentPointComponent])

  const existingPoints: Record<Entity, Vector3> = {}

  for (const entity of attachmentPointQuery()) {
    //get transform
    const transform = getComponent(entity, TransformComponent)
    // loop through existingPoints and check if any of them are close enough to attach to
    // if so, attach to that point

    //add transform to existingPoints
    existingPoints[entity] = transform.position
  }
}

export const AttachmentPointSystem = defineSystem({
  uuid: 'ee.engine.AttachmentPointSystem',
  execute
})
