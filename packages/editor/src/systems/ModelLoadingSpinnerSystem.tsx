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

import {
  Entity,
  Layers,
  PresentationSystemGroup,
  QueryReactor,
  defineSystem,
  getAuthoringCounterpart,
  removeEntityNodeRecursively,
  useComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { createLoadingSpinner } from '@ir-engine/engine/src/scene/functions/spatialLoadingSpinner'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect, useRef } from 'react'

const LoadingSpinnerReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const authoringCounterpart = getAuthoringCounterpart(entity)
  const gltfComponent = useComponent(authoringCounterpart, GLTFComponent)
  const errors = !!useOptionalComponent(authoringCounterpart, ErrorComponent)?.value?.[GLTFComponent.name]
  const loaded = GLTFComponent.useSceneLoaded(authoringCounterpart)
  const isScene = useHasComponent(entity, SceneComponent)
  const spinnerEntity = useRef<Entity | null>(null)
  const shouldHaveSpinned = !isScene && !!gltfComponent.src.value && !errors && !loaded

  useEffect(() => {
    if (!shouldHaveSpinned) return
    spinnerEntity.current = createLoadingSpinner(`loading ${gltfComponent.src.value}`, entity)
    return () => {
      removeEntityNodeRecursively(spinnerEntity?.current!)
      spinnerEntity.current = null
    }
  }, [shouldHaveSpinned])

  return null
}

export const ModelLoadingSpinnerSystem = defineSystem({
  uuid: 'ee.editor.ModelLoadingSpinnerSystem',
  insert: { before: PresentationSystemGroup },
  reactor: () => (
    <QueryReactor ChildEntityReactor={LoadingSpinnerReactor} Components={[GLTFComponent]} layer={Layers.Simulation} />
  )
})
