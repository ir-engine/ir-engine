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

import { hookstate, none } from '@etherealengine/hyperflux'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { SceneID } from '../../schemas/projects/scene.schema'

const entitiesByScene = {} as Record<string, Entity[]>

/** Used to identity an entity that has been loaded as part of a scene */
export const SceneObjectComponent = defineComponent({
  name: 'SceneObjectComponent',

  onInit() {
    return '' as SceneID
  },

  onSet: (entity, component, sceneID?: SceneID) => {
    if (typeof sceneID !== 'string') throw new Error('SceneObjectComponent expects a non-empty string')
    component.set(sceneID)
    SceneObjectComponent.valueMap[entity] = sceneID
    const exists = SceneObjectComponent.entitiesByScene[sceneID]
    const entitiesBySceneState = SceneObjectComponent.entitiesBySceneState
    if (exists) entitiesBySceneState.merge({ [sceneID]: [...exists, entity] })
    else entitiesBySceneState.merge({ [sceneID]: [entity] })
  },

  onRemove: (entity, component) => {
    const name = component.value
    const entities = SceneObjectComponent.entitiesBySceneState[name]
    const isSingleton = entities.length === 1
    isSingleton && entities.set(none)
    !isSingleton && entities.set(entities.value.filter((e) => e !== entity))
  },

  entitiesBySceneState: hookstate(entitiesByScene),
  entitiesByScene: entitiesByScene as Readonly<typeof entitiesByScene>
})
