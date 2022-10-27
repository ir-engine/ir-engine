import { getState } from '@xrengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  ComponentType,
  createMappedComponent,
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
    getState(EngineState).transformsNeedSorting.set(true)
  }

  get computeFunction() {
    return this.#computeFunction
  }

  set computeFunction(v) {
    this.#computeFunction = v
  }
}

export const ComputedTransformComponent = createMappedComponent<ComputedTransform>('ComputedTransformComponent')

export function setComputedTransformComponent(
  entity: Entity,
  referenceEntity: Entity,
  computeFunction: (entity: Entity, referenceEntity: Entity) => void
) {
  const computed =
    getOptionalComponent(entity, ComputedTransformComponent) ||
    (setComponent(entity, ComputedTransformComponent, new ComputedTransform()) as any as ComponentType<
      typeof ComputedTransformComponent
    >)
  computed.referenceEntity = referenceEntity
  computed.computeFunction = computeFunction
  return computed
}
