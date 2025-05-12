/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import {
  NO_PROXY_STEALTH,
  State,
  defineState,
  destroy,
  getMutableState,
  getState,
  hookstate,
  none,
  useHookstate
} from '@ir-engine/hyperflux'
import { v4 as uuidv4 } from 'uuid'
import {
  LayerComponent,
  LayerID,
  Layers,
  createEntity,
  defineComponent,
  getComponent,
  setComponent,
  useComponent
} from './ComponentFunctions'
import { Entity, EntityID, EntityUUID, EntityUUIDPair, SourceID, UndefinedEntity } from './Entity'
import { S } from './schemas/JSONSchemas'

export const EntitiesBySourceState = defineState({
  name: 'ir.world.EntitiesBySourceState',
  initial: {} as Record<LayerID, Record<SourceID, Entity[]>>
})

/**
 * UUIDComponent provides a unique identifier for entities by combining a source ID and an entity ID.
 *
 * The component stores an {@link EntityUUIDPair} which consists of:
 * - entitySourceID: Identifies the source/context of the entity (e.g., a model, scene, or avatar)
 * - entityID: Identifies the entity uniquely within that source context
 *
 * This split structure allows for:
 * - Deterministic entity creation across network peers
 * - Hierarchical relationships between entities from the same source
 * - Efficient entity lookup within a specific source context
 * - Consistent entity references across different layers (simulation, authoring)
 *
 * The full unique ID is created by concatenating these two parts, ensuring uniqueness across the
 * engine runtime while maintaining the relationship between entities from the same source.
 *
 * A full unique ID can be used as a source ID for other entities, using the {@link UUIDComponent.getAsSourceID} method.
 *
 * @property {SourceID} entitySourceID Identifies the source/context of the entity
 * @property {EntityID} entityID Identifies the entity uniquely within that source context
 */
export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',

  jsonID: 'EE_uuid',

  schema: S.EntityUUIDPair({
    validate: (idPair, prev, entity) => {
      if (idPair === prev) return true
      if (!idPair.entitySourceID) {
        console.error('UUID context cannot be empty')
        return false
      }
      if (!idPair.entityID) {
        console.error('UUID id cannot be empty')
        return false
      }
      const uuid = UUIDComponent.join(idPair)
      const layer = LayerComponent.get(entity)
      if (!UUIDComponent.entitiesByUUIDState[layer]) {
        UUIDComponent.entitiesByUUIDState[layer] = {}
        return true
      }
      // throw error if uuid is already in use
      const currentEntity = UUIDComponent.entitiesByUUIDState[layer][uuid]?.value
      if (currentEntity && currentEntity !== entity) {
        console.error(`UUID ${uuid} is already in use`, currentEntity, entity)
        return false
      }

      return true
    },
    required: true
  }),

  toJSON(component) {
    return { entityID: component.entityID }
  },

  onSet(entity, component, idPair: EntityUUIDPair) {
    if (!idPair.entitySourceID) throw new Error('UUID context cannot be empty')
    if (!idPair.entityID) throw new Error('UUID id cannot be empty')

    const layer = LayerComponent.get(entity)
    const prev =
      component.value.entityID && component.value.entitySourceID ? UUIDComponent.join(component.value) : undefined
    // remove old uuid
    if (prev) {
      UUIDComponent.onRemove(entity, component)
    }

    // set new uuid
    UUIDComponentFunctions._getUUIDState(UUIDComponent.join(idPair), layer).set(entity)

    component.set(idPair)

    if (!getState(EntitiesBySourceState)[layer]) {
      getMutableState(EntitiesBySourceState)[layer].set({})
    }
    const state = getMutableState(EntitiesBySourceState)[layer]
    const entitiesBySourceState = state[idPair.entitySourceID]
    if (!entitiesBySourceState.value) {
      entitiesBySourceState.set([entity])
    } else {
      if (!entitiesBySourceState.value.includes(entity)) entitiesBySourceState.merge([entity])
    }
  },

  onRemove: (entity, component) => {
    const uuid = UUIDComponent.join(component.value)
    const layer = LayerComponent.get(entity)
    destroy(UUIDComponent.entitiesByUUIDState[layer][uuid])
    delete UUIDComponent.entitiesByUUIDState[layer][uuid]

    const source = component.value.entitySourceID.toString()
    const entities = getState(EntitiesBySourceState)[layer][source].filter((currentEntity) => currentEntity !== entity)
    const layerState = getMutableState(EntitiesBySourceState)[layer]
    if (entities.length === 0) {
      layerState[source].set(none)
    } else {
      layerState[source].set(entities)
    }
  },

  entitiesByUUIDState: {} as Record<LayerID, Record<EntityUUID, State<Entity>>>,

  create: (sourceEntity: Entity, nodeID = UUIDComponent.generate(), layer = Layers.Simulation as LayerID) => {
    const entity = createEntity(layer)
    setComponent(entity, UUIDComponent, {
      entitySourceID: UUIDComponent.getAsSourceID(sourceEntity),
      entityID: nodeID
    })
    return entity
  },

  /** Reactively gets an entity by UUID */
  useEntityByUUID(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
    return useHookstate(UUIDComponentFunctions._getUUIDState(uuid, layer)).value
  },

  /** Gets an entity by UUID */
  getEntityByUUID(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
    return UUIDComponentFunctions._getUUIDState(uuid, layer).get(NO_PROXY_STEALTH)
  },

  /** Gets an entity from the same source by ID */
  getEntityFromSameSourceByID(entity: Entity, id: EntityID, layer = Layers.Simulation as LayerID) {
    const entitySourceID = getComponent(entity, UUIDComponent).entitySourceID
    return UUIDComponent.getEntityByUUID(UUIDComponent.join({ entitySourceID, entityID: id }), layer)
  },

  /** Reactively gets an entity from the same source by ID */
  useEntityFromSameSourceByID(entity: Entity, id: EntityID, layer = Layers.Simulation as LayerID) {
    const entitySourceID = useComponent(entity, UUIDComponent).entitySourceID.value
    return UUIDComponent.useEntityByUUID(UUIDComponent.join({ entitySourceID, entityID: id }), layer)
  },

  setSourceEntity(entity: Entity, source: Entity) {
    const sourceID = getComponent(source, UUIDComponent).entitySourceID
    const entityID = getComponent(entity, UUIDComponent).entityID
    setComponent(entity, UUIDComponent, { entitySourceID: sourceID, entityID })
  },

  getSourceEntity(entity: Entity) {
    const layer = LayerComponent.get(entity)
    const entitySourceID = getComponent(entity, UUIDComponent).entitySourceID as any as EntityUUID
    return UUIDComponent.getEntityByUUID(entitySourceID, layer)
  },

  useSourceEntity(entity: Entity) {
    const layer = LayerComponent.get(entity)
    const entitySourceID = useComponent(entity, UUIDComponent).entitySourceID.value as any as EntityUUID
    return UUIDComponent.useEntityByUUID(entitySourceID, layer)
  },

  useEntitiesBySource: (sourceID: SourceID, layer = Layers.Simulation as LayerID) => {
    const state = useHookstate(getMutableState(EntitiesBySourceState)[layer]).value
    return state?.[sourceID] || []
  },

  getEntitiesBySource: (sourceID: SourceID, layer = Layers.Simulation as LayerID): Entity[] => {
    return getState(EntitiesBySourceState)[layer]?.[sourceID] || []
  },

  /** Construct a new SourceID from the concatenated values of the source entity */
  getAsSourceID: (entity: Entity) => UUIDComponent.join(getComponent(entity, UUIDComponent)) as any as SourceID,

  /** Gets a UUID as a string */
  get: (entity: Entity) => UUIDComponent.join(getComponent(entity, UUIDComponent)),

  /** Reactively gets a UUID as a string */
  use: (entity: Entity) => UUIDComponent.join(useComponent(entity, UUIDComponent).value),

  /** Joins an EntityUUIDPair into a string */
  join: (idPair: EntityUUIDPair) => `${idPair.entitySourceID}${idPair.entityID}` as EntityUUID,

  /** @deprecated use UUIDComponent.generate() instead */
  generateUUID() {
    return UUIDComponent.generate()
  },

  /** Generates a new UUID */
  generate() {
    return uuidv4() as EntityID
  }
})

function _getUUIDState(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
  let layerState = UUIDComponent.entitiesByUUIDState[layer]
  if (!layerState) {
    layerState = {}
    UUIDComponent.entitiesByUUIDState[layer] = layerState
  }

  let entityState = layerState[uuid]
  if (!entityState) {
    entityState = hookstate(UndefinedEntity)
    layerState[uuid] = entityState
  }
  return entityState
}

export const UUIDComponentFunctions = {
  /** @private Exposed only for unit tests */
  _getUUIDState
}
