import {
  Entity,
  EntityID,
  getAuthoringCounterpart,
  getComponent,
  getOptionalComponent,
  hasComponent,
  useComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { SourceComponent } from '../../scene/components/SourceComponent'

export type CallbackOptionType = {
  callbacks: Array<{
    label: string
    value: EntityID | 'Self'
  }>
  label: string
  value: EntityID | 'Self'
}

export type NodeOptionsType = {
  label: string
  value: EntityID | 'Self'
}

/**
 * Returns an options list of entities in the same source that have a CallbackComponent
 *
 * @param entity An entity in the same source
 * @returns
 */
export const useCallbackQueryOptions = (entity: Entity) => {
  const sourceEntity = useComponent(entity, SourceComponent).value
  const query = SourceComponent.getEntitiesBySource(sourceEntity).filter(
    (e) => !!getAuthoringCounterpart(e) && hasComponent(e, CallbackComponent)
  )
  return query
    .map((e) => {
      const options = [] as CallbackOptionType[]
      const entityCallbacks = getOptionalComponent(e, CallbackComponent)
      if (entityCallbacks) {
        options.push({
          label: e === entity ? 'Self' : getComponent(e, NameComponent),
          value: e === entity ? 'Self' : getComponent(e, UUIDComponent).entityID,
          callbacks: Object.keys(entityCallbacks).map((cb) => {
            return { label: cb, value: cb as EntityID }
          })
        })
      } else if (e === entity) {
        options.push({
          label: 'Self',
          value: 'Self',
          callbacks: []
        })
      }
      return options
    })
    .flat()
}

/**
 * Returns an options list of entities in the same source
 *
 * @param entity An entity in the same source
 * @returns
 */
export const useNodeOptions = (entity: Entity) => {
  const sourceEntity = useComponent(entity, SourceComponent).value
  const query = SourceComponent.getEntitiesBySource(sourceEntity)
  return query.map((entity) => {
    return {
      label: entity === entity ? 'Self' : getComponent(entity, NameComponent),
      value: entity === entity ? '' : getComponent(entity, UUIDComponent).entityID
    }
  })
}
