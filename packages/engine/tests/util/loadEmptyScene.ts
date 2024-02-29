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
import { SceneID } from '@etherealengine/common/src/schema.type.module'
import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { SceneState } from '../../src/scene/Scene'
import { SceneObjectComponent } from '../../src/scene/components/SceneObjectComponent'
import { SceneTagComponent } from '../../src/scene/components/SceneTagComponent'
import { SourceComponent } from '../../src/scene/components/SourceComponent'

export const loadEmptyScene = () => {
  SceneState.loadScene('test' as SceneID, {
    name: '',
    thumbnailUrl: '',
    project: '',
    scenePath: 'test' as SceneID,
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
  setComponent(entity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(entity, SourceComponent, 'test' as SceneID)
}
