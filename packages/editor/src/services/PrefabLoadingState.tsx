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

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  getComponent,
  removeEntity,
  setComponent,
  useOptionalComponent
} from '@etherealengine/ecs'
import { GLTFComponent } from '@etherealengine/engine/src/gltf/GLTFComponent'
import { GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { getModelSceneID } from '@etherealengine/engine/src/scene/functions/loaders/ModelFunctions'
import { defineState, getMutableState, getState, none, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import React, { useEffect } from 'react'
import { MathUtils } from 'three'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import { EditorState } from './EditorServices'

export const addPrefabGLTF = (filePath: string, targetEntity = getState(EditorState).rootEntity) => {
  getMutableState(PrefabLoadingState).merge([
    {
      filePath,
      targetEntityUUID: getComponent(targetEntity, UUIDComponent)
    }
  ])
}

// for testing
globalThis.addPrefabGLTF = addPrefabGLTF

/**
 * PrefabLoadingState stores requests for loading a prefab into a target entity
 */
export const PrefabLoadingState = defineState({
  name: 'PrefabLoadingState',
  initial: [] as Array<{ filePath: string; targetEntityUUID: EntityUUID }>,
  reactor: () => {
    const state = useMutableState(PrefabLoadingState)

    return (
      <>
        {state.value.map(({ filePath, targetEntityUUID }) => (
          <PrefabLoadingReactor
            key={filePath + targetEntityUUID}
            filePath={filePath}
            targetEntityUUID={targetEntityUUID}
          />
        ))}
      </>
    )
  }
})

const PrefabLoadingReactor = (props: { filePath: string; targetEntityUUID: EntityUUID }) => {
  const { filePath, targetEntityUUID } = props
  const state = useHookstate({
    entity: UndefinedEntity
  })

  /** Step 1 - load the prefab */
  useEffect(() => {
    const targetEntity = UUIDComponent.getEntityByUUID(targetEntityUUID)
    const isTargetEntityGLTF = getState(GLTFSourceState)[getComponent(targetEntity, SourceComponent)]
    if (isTargetEntityGLTF) {
      const entity = createEntity()
      setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
      const sourceID = `${getComponent(entity, UUIDComponent)}-${filePath}`
      setComponent(entity, SourceComponent, sourceID)
      setComponent(entity, GLTFComponent, { src: filePath })
      state.merge({ entity })
    } else {
      const entity = createEntity()
      setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
      const sourceID = `${getComponent(entity, UUIDComponent)}-${filePath}`
      setComponent(entity, SourceComponent, sourceID)
      setComponent(entity, ModelComponent, { src: filePath })
      state.merge({ entity })
    }
  }, [])

  if (!state.entity.value) return null

  /** Step 2 - Wait for prefab data to load */
  return <GLTFLoadingReactor filePath={filePath} entity={state.entity.value} targetEntityUUID={targetEntityUUID} />
}

const GLTFLoadingReactor = (props: { filePath: string; entity: Entity; targetEntityUUID: EntityUUID }) => {
  const sceneState = useHookstate(getMutableState(SceneState).scenes)
  const sourceID = getModelSceneID(props.entity)
  const sceneJsonLoaded = !!sceneState.value[sourceID]
  const gltfLoaded = useOptionalComponent(props.entity, GLTFComponent)?.progress?.value === 100

  useEffect(() => {
    if (sceneJsonLoaded || gltfLoaded) {
      /** 3. Copy the prefab data into the target entity */
      EditorControlFunctions.copyChildren(props.entity, UUIDComponent.getEntityByUUID(props.targetEntityUUID))
      /** 4. Remove the prefab entity */
      removeEntity(props.entity)
      /** 5. Remove the prefab loading request */
      const index = getMutableState(PrefabLoadingState).value.findIndex((prefab) => prefab.filePath === props.filePath)
      getMutableState(PrefabLoadingState)[index].set(none)
    }
  }, [sceneJsonLoaded, gltfLoaded])

  return null
}
