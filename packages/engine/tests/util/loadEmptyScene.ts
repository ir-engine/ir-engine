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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneState } from '../../src/ecs/classes/Scene'
import { setComponent } from '../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../src/ecs/functions/EntityTree'
import { NameComponent } from '../../src/scene/components/NameComponent'
import { SceneObjectComponent } from '../../src/scene/components/SceneObjectComponent'
import { SceneTagComponent } from '../../src/scene/components/SceneTagComponent'
import { UUIDComponent } from '../../src/scene/components/UUIDComponent'
import { VisibleComponent } from '../../src/scene/components/VisibleComponent'
import { SceneID } from '../../src/schemas/projects/scene.schema'
import { TransformComponent } from '../../src/transform/components/TransformComponent'

export const loadEmptyScene = () => {
  SceneState.loadScene('test' as SceneID, {
    id: '' as SceneID,
    name: '',
    thumbnailUrl: '',
    project: '',
    scene: {
      entities: {
        ['root' as EntityUUID]: {
          name: 'Root',
          components: []
        }
      },
      version: 0,
      root: 'root' as EntityUUID
    }
  })
  const entity = createEntity()
  setComponent(entity, NameComponent, 'Root')
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, UUIDComponent, 'root' as EntityUUID)
  setComponent(entity, SceneTagComponent, true)
  setComponent(entity, TransformComponent)
  setComponent(entity, SceneObjectComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity: null })
}
