import { Entity, EntityUUID, UUIDComponent, getOptionalComponent } from '@ir-engine/ecs'
import { defineState, getMutableState, none } from '@ir-engine/hyperflux'

export const ComponentDropdownState = defineState({
  name: 'ComponentDropdownState',
  initial: () => ({
    componentStates: {} as Record<EntityUUID, Record<string, boolean>> //use name as key
  })
})

function addOrUpdateComponentStateByEntity(entity: Entity, componentName: string, value: boolean) {
  const entityUUID = getOptionalComponent(entity, UUIDComponent)
  if (!entityUUID) return

  const componentStates = getMutableState(ComponentDropdownState).componentStates
  // Ensure entityUUID entry exists; if not, initialize it as an empty object
  if (!componentStates.value[entityUUID]) {
    componentStates[entityUUID].set({} as Record<string, boolean>)
  }

  // Set the componentName state within the specific entityUUID
  componentStates[entityUUID][componentName].set(value)
}

function ensureInitializedComponentState(entity: Entity, componentName: string, value: boolean) {
  const entityUUID = getOptionalComponent(entity, UUIDComponent)
  if (!entityUUID) return
  const componentStates = getMutableState(ComponentDropdownState).componentStates
  // Ensure entityUUID entry exists; if not, initialize it as an empty object
  if (!componentStates.value[entityUUID]) {
    componentStates[entityUUID].set({} as Record<string, boolean>)
    // Set the componentName state within the specific entityUUID
    componentStates[entityUUID][componentName].set(value)
  }
}

function addOrUpdateComponentStateByUUID(entityUUID: EntityUUID, componentName: string, value: boolean) {
  const componentStates = getMutableState(ComponentDropdownState).componentStates
  // Ensure entityUUID entry exists; if not, initialize it as an empty object
  if (!componentStates.value[entityUUID]) {
    componentStates[entityUUID].set({} as Record<string, boolean>)
  }

  // Set the componentName state within the specific entityUUID
  componentStates[entityUUID][componentName].set(value)
}

function removeEntityFromComponentState(entityUUID: EntityUUID) {
  const componentStates = getMutableState(ComponentDropdownState).componentStates
  componentStates[entityUUID].set(none)
}

function removeEntitiesFromComponentState(entityUUIDs: EntityUUID[]) {
  for (const entityUUID of entityUUIDs) {
    removeEntityFromComponentState(entityUUID)
  }
}

function removeComponentFromComponentStateByEntity(entities: Entity[], componentName: string) {
  for (const entity of entities) {
    const entityUUID = getOptionalComponent(entity, UUIDComponent)
    if (!entityUUID) continue

    const componentStates = getMutableState(ComponentDropdownState).componentStates
    if (!componentStates.value[entityUUID]) continue

    componentStates[entityUUID][componentName].set(none)
    // if (componentStates[entityUUID].keys.length === 0) {
    //   componentStates[entityUUID].set(none)
    // }
  }
}

export const ComponentDropdownStateFunctions = {
  ensureInitializedComponentState,
  addOrUpdateComponentStateByUUID,
  addOrUpdateComponentStateByEntity,
  removeEntityFromComponentState,
  removeEntitiesFromComponentState,
  removeComponentFromComponentStateByEntity
}
