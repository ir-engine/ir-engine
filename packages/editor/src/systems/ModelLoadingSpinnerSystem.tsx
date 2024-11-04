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

import { useHookstate } from '@hookstate/core'
import {
  Entity,
  PresentationSystemGroup,
  UndefinedEntity,
  defineSystem,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { createLoadingSpinner } from '@ir-engine/engine/src/scene/functions/spatialLoadingSpinner'
import { getMutableState } from '@ir-engine/hyperflux'
import {
  removeEntityNodeRecursively,
  useChildrenWithComponents
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { EditorState } from '../services/EditorServices'

const LoadingSpinnerReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const modelComponent = useComponent(entity, ModelComponent)
  const errors = !!useOptionalComponent(entity, ErrorComponent)?.value?.[ModelComponent.name]

  const loadingEntity = useHookstate<Entity>(UndefinedEntity)

  const createLoadingGeo = () => {
    const spinnerEntity = createLoadingSpinner(`loading ${modelComponent.src.value}`, entity)
    loadingEntity.set(spinnerEntity)
  }

  const removeLoadingGeo = () => {
    if (!loadingEntity.value) return
    removeEntityNodeRecursively(loadingEntity.value)
    loadingEntity.set(UndefinedEntity)
  }

  useEffect(() => {
    if (loadingEntity.value) return
    createLoadingGeo()
  }, [modelComponent.src.value])

  useEffect(() => {
    if (!errors) return
    removeLoadingGeo()
  }, [errors])

  useEffect(() => {
    if (!modelComponent.scene.value) return
    removeLoadingGeo()
  }, [modelComponent.scene.value])

  return null
}

const reactor = () => {
  const studioSceneEntity = useHookstate(getMutableState(EditorState)).rootEntity.value
  const entities = useChildrenWithComponents(studioSceneEntity, [ModelComponent, SourceComponent])
  if (!studioSceneEntity) return null
  return (
    <>
      {entities.map((entity) => (
        <LoadingSpinnerReactor key={entity} entity={entity} />
      ))}
    </>
  )
}

export const ModelLoadingSpinnerSystem = defineSystem({
  uuid: 'ee.editor.ModelLoadingSpinnerSystem',
  insert: { before: PresentationSystemGroup },
  reactor
})
