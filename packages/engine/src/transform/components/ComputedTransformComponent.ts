import { getMutableState } from '@etherealengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  ComponentType,
  createMappedComponent,
  defineComponent,
  getComponent,
  getOptionalComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'

class ComputedTransform {
  _referenceEntity = UndefinedEntity

  // Our ECS debugger/inspector crashes when it encounters enumerable functions,
  // so we have to make sure this function is not an instance property
  #computeFunction = (entity: Entity, referenceEntity: Entity) => {}

  get referenceEntity() {
    return this._referenceEntity
  }

  set referenceEntity(v) {
    if (this._referenceEntity === v) return
    this._referenceEntity = v
    getMutableState(EngineState).transformsNeedSorting.set(true)
  }

  get computeFunction() {
    return this.#computeFunction
  }

  set computeFunction(v) {
    this.#computeFunction = v
  }
}

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

/** @deprecated */
export function setComputedTransformComponent(
  entity: Entity,
  referenceEntity: Entity,
  computeFunction: (entity: Entity, referenceEntity: Entity) => void
) {
  setComponent(entity, ComputedTransformComponent, { referenceEntity, computeFunction })
}
