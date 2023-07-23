/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import matches, { Validator } from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

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
  jsonID: 'load-volume',
  onInit: (entity) => ({ targets: {} }) as LoadVolumeComponentType,
  toJSON: (entity, component) => {
    return component.value
  },
  onSet: (entity, component, json) => {
    if (!json) return

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
        const targetEntity = UUIDComponent.entitiesByUUID[uuid]
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
