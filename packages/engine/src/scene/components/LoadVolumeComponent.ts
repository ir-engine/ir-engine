import matches, { Validator } from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { EntityTreeComponent, removeEntityNodeRecursively } from '../../ecs/functions/EntityTree'
import { serializeEntity } from '../functions/serializeWorld'
import { updateSceneEntity } from '../systems/SceneLoadingSystem'
import { CallbackComponent, setCallback } from './CallbackComponent'
import { UUIDComponent } from './UUIDComponent'

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
        const targetEntity = UUIDComponent.entitiesByUUID[uuid].value!
        const parent = getComponent(targetEntity, EntityTreeComponent)
        const parentNode = parent.parentEntity!
        const clearChildren = () => removeEntityNodeRecursively(targetEntity)
        const componentJson = serializeEntity(targetEntity)
        clearChildren()
        const entityJson: EntityJson = {
          name: uuid,
          parent: getComponent(parentNode, UUIDComponent),
          components: componentJson
        }
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
