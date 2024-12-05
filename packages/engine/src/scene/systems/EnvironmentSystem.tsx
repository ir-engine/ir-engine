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

import React, { useEffect } from 'react'

import {
  defineSystem,
  Entity,
  getComponent,
  PresentationSystemGroup,
  QueryReactor,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { haveCommonAncestor, useChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EnvmapComponent, updateEnvMap } from '../components/EnvmapComponent'
import { SourceComponent } from '../components/SourceComponent'
import { EnvMapSourceType } from '../constants/EnvMapEnum'

const EnvmapReactor = (props: { backgroundEntity: Entity }) => {
  const entity = useEntityContext()
  const envmapComponent = useComponent(entity, EnvmapComponent)
  const backgroundComponent = useComponent(props.backgroundEntity, BackgroundComponent)
  const hasRootMesh = !!useOptionalComponent(entity, MeshComponent)
  const childrenMesh = useChildrenWithComponents(
    entity,
    [MeshComponent, VisibleComponent, SourceComponent],
    [EnvmapComponent]
  )

  const getMeshes = () => {
    const meshEntities = [...childrenMesh]
    if (hasRootMesh) meshEntities.push(entity)

    return meshEntities.map((meshEntity) => getComponent(meshEntity, MeshComponent))
  }

  useEffect(() => {
    if (!haveCommonAncestor(entity, props.backgroundEntity)) return
    if (envmapComponent.type.value !== EnvMapSourceType.Skybox) return
    const meshes = getMeshes()

    for (const mesh of meshes) {
      updateEnvMap(mesh, backgroundComponent.value as any)
    }
    return () => {
      for (const mesh of meshes) {
        updateEnvMap(mesh, null)
      }
    }
  }, [childrenMesh, envmapComponent.type, backgroundComponent])

  return null
}

const BackgroundReactor = () => {
  const backgroundEntity = useEntityContext()
  return <QueryReactor Components={[EnvmapComponent]} ChildEntityReactor={EnvmapReactor} props={{ backgroundEntity }} />
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => <QueryReactor Components={[BackgroundComponent]} ChildEntityReactor={BackgroundReactor} />
})
