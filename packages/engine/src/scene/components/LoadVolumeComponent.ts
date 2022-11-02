import { useEffect } from 'react'
import matches, { Validator } from 'ts-matches'

import { EntityUUID } from '@xrengine/common/src/interfaces/EntityUUID'
import { EntityJson } from '@xrengine/common/src/interfaces/SceneInterface'
import logger from '@xrengine/common/src/logger'
import {
  defineComponent,
  hasComponent,
  removeComponent,
  useOptionalComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { EntityReactorProps, removeEntity } from '../../ecs/functions/EntityFunctions'
import { getEntityTreeNodeByUUID, iterateEntityNode, removeEntityNodeFromParent } from '../../ecs/functions/EntityTree'
import { serializeEntity } from '../functions/serializeWorld'
import { updateSceneEntity } from '../systems/SceneLoadingSystem'
import { CallbackComponent, setCallback } from './CallbackComponent'

export type LoadVolumeTarget = {
  uuid: EntityUUID
  entityJson: EntityJson
  loaded: boolean
}

export type LoadVolumeComponentType = {
  targets: Record<EntityUUID, LoadVolumeTarget>
}

export const LoadVolumeComponent = defineComponent({
  name: 'EE_load_volume',
  onInit: (entity) => ({ targets: {} } as LoadVolumeComponentType),
  toJSON: (entity, component) => {
    return component.value
  },
  onSet: (entity, component, json) => {
    if (!json) return
    const world = Engine.instance.currentWorld
    const nodeMap = world.entityTree.entityNodeMap

    if ((matches.object as Validator<unknown, Record<EntityUUID, LoadVolumeTarget>>).test(json.targets)) {
      component.targets.set(json.targets)
    }

    function doLoad() {
      Object.values(component.targets.value).map(({ uuid, loaded, entityJson }) => {
        if (loaded) return
        updateSceneEntity(entityJson.name as EntityUUID, entityJson)
        component.targets
      })
      component.targets.merge((_targets) => {
        Object.keys(_targets).map((_uuid) => {
          _targets[_uuid] = { ..._targets[_uuid], loaded: true }
        })
        return _targets
      })
    }

    function doUnload() {
      Object.values(component.targets.value).map(({ uuid, loaded, entityJson: oldEJson }) => {
        if (!loaded) return
        let targetEntity: Entity
        let clearChildren = () => removeEntity(targetEntity)

        const targetNode = getEntityTreeNodeByUUID(uuid)!
        const parentNode = nodeMap.get(targetNode.parentEntity!)!
        targetEntity = targetNode.entity
        clearChildren = () =>
          iterateEntityNode(targetNode, (node) => {
            node.children.filter((entity) => !nodeMap.has(entity)).map((entity) => removeEntity(entity))
            removeEntityNodeFromParent(node)
            removeEntity(node.entity)
          })
        const componentJson = serializeEntity(targetEntity)
        clearChildren()
        const entityJson: EntityJson = { name: uuid, parent: parentNode.uuid, components: componentJson }
        component.targets[uuid].set({ uuid, loaded: false, entityJson })
      })
    }

    if (hasComponent(entity, CallbackComponent)) {
      removeComponent(entity, CallbackComponent)
    }

    setCallback(entity, 'doLoad', doLoad)
    setCallback(entity, 'doUnload', doUnload)
  }
})

export const SCENE_COMPONENT_LOAD_VOLUME = 'load-volume'
