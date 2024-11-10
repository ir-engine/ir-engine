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

import { useEffect } from 'react'
import { Object3D } from 'three'

import {
  createEntity,
  Entity,
  generateEntityUUID,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'

type DisposableObject3D = Object3D & { dispose?: () => void }

export function useHelperEntity<TObject extends DisposableObject3D>(
  parentEntity: Entity,
  helperFactory: () => TObject,
  enabled: boolean,
  layerMask = ObjectLayerMasks.NodeHelper
): Entity {
  const helperEntityState = useHookstate(UndefinedEntity)
  const nameComponent = useOptionalComponent(parentEntity, NameComponent)

  useEffect(() => {
    const helperEntity = createEntity()
    const helper = helperFactory()
    setComponent(helperEntity, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(helperEntity, ObjectComponent, helper)
    setComponent(helperEntity, UUIDComponent, generateEntityUUID())
    setComponent(helperEntity, ObjectLayerMaskComponent, layerMask)
    setVisibleComponent(helperEntity, true)

    return () => {
      if (helper.dispose) helper.dispose()
      removeEntity(helperEntity)
    }
  }, [enabled])

  useEffect(() => {
    if (!helperEntityState.value) return
    setComponent(helperEntityState.value, NameComponent, `${nameComponent?.value ?? parentEntity}-helper`)
  }, [helperEntityState.value, nameComponent])

  return helperEntityState.value
}
