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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Mesh, Object3D } from 'three'

import {
  createEntity,
  Entity,
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useOptionalComponent
} from '@ir-engine/ecs'
import { useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { InputComponent } from '../../input/components/InputComponent'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ActiveHelperComponent } from '../ActiveHelperComponent'

type DisposableObject3D = Object3D & { update?: () => void; dispose?: () => void }

export function useHelperEntity<TObject extends DisposableObject3D>(
  parentEntity: Entity,
  helperFactory: () => TObject,
  enabled: boolean,
  layerMask = ObjectLayerMasks.Helper,
  nameSuffix = 'helper'
): Entity {
  const helperEntityState = useHookstate(UndefinedEntity)
  const nameComponent = useOptionalComponent(parentEntity, NameComponent)
  const transform = useOptionalComponent(helperEntityState.value, TransformComponent)

  useEffect(() => {
    setComponent(parentEntity, ActiveHelperComponent)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const helperEntity = createHelperEntity(parentEntity, helperFactory, layerMask)
    const helper = getComponent(helperEntity, ObjectComponent) as TObject
    const helperMesh = helper.children[0] as Mesh<any, any> | undefined
    helperEntityState.set(helperEntity)
    if (typeof helper.update === 'function') helper.update()
    return () => {
      if (helperMesh) {
        helperMesh.material.dispose()
        helperMesh.geometry.dispose()
      } else if (helper.dispose) helper.dispose()
      helperEntityState.set(UndefinedEntity)
      removeEntity(helperEntity)
    }
  }, [enabled])

  useEffect(() => {
    if (!helperEntityState.value) return
    setComponent(helperEntityState.value, NameComponent, `${nameComponent?.value ?? parentEntity}-${nameSuffix}`)
  }, [helperEntityState.value, nameComponent, enabled])

  useEffect(() => {
    if (!helperEntityState.value || !transform) return
    const helper = getOptionalComponent(helperEntityState.value, ObjectComponent) as TObject
    if (!helper) return
    if (typeof helper.update === 'function') helper.update()
  }, [transform, helperEntityState.value, enabled])

  return helperEntityState.value
}

export function createHelperEntity<TObject extends DisposableObject3D>(
  parentEntity: Entity,
  helperFactory: () => TObject,
  layerMask = ObjectLayerMasks.Helper,
  nameSuffix = '-helper'
): Entity {
  const helperEntity = createEntity()
  const name = getComponent(parentEntity, NameComponent)
  const helper = helperFactory()
  helper.preserveChildren = true

  setComponent(helperEntity, EntityTreeComponent, { parentEntity: parentEntity })
  setComponent(helperEntity, TransformComponent)
  setComponent(helperEntity, ObjectComponent, helper)
  setComponent(helperEntity, ObjectLayerMaskComponent, layerMask)
  setComponent(helperEntity, VisibleComponent, true)

  setComponent(helperEntity, NameComponent, `${name ?? parentEntity}-${nameSuffix}`)
  setComponent(helperEntity, InputComponent, { grow: true })
  return helperEntity
}
