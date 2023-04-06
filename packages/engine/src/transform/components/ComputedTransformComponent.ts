import { getMutableState } from '@etherealengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export const ComputedTransformComponent = defineComponent({
  name: 'ComputedTransformComponent',

  onInit(entity) {
    return {
      referenceEntity: UndefinedEntity,
      computeFunction: (entity: Entity, referenceEntity: Entity) => {}
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.referenceEntity === 'number') component.referenceEntity.set(json.referenceEntity)
    if (typeof json.computeFunction === 'function') component.merge({ computeFunction: json.computeFunction })

    getMutableState(EngineState).transformsNeedSorting.set(true)
  }
})

export function setComputedTransformComponent(
  entity: Entity,
  referenceEntity: Entity,
  computeFunction: (entity: Entity, referenceEntity: Entity) => void
) {
  setComponent(entity, ComputedTransformComponent, { referenceEntity, computeFunction })
}
