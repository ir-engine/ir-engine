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

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneSnapshotAction, SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { defineQuery } from '@etherealengine/engine/src/ecs/functions/QueryFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { createSceneEntity } from '@etherealengine/engine/src/ecs/functions/createSceneEntity'
import { InputState } from '@etherealengine/engine/src/input/state/InputState'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ObjectLayerComponents } from '@etherealengine/engine/src/scene/components/ObjectLayerComponent'
import { SceneObjectComponent } from '@etherealengine/engine/src/scene/components/SceneObjectComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { toEntityJson } from '@etherealengine/engine/src/scene/functions/serializeWorld'
import { TransformSystem } from '@etherealengine/engine/src/transform/TransformModule'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { NO_PROXY, defineState, dispatchAction, getMutableState, getState, useState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Cache, Intersection, Quaternion, Raycaster, Vector3 } from 'three'
import { EditorHelperState, PlacementMode } from '../services/EditorHelperState'
import { ObjectGridSnapState } from './ObjectGridSnapSystem'

export const ClickPlacementState = defineState({
  name: 'ClickPlacementState',
  initial: {
    placementEntity: null as Entity | null,
    selectedAsset: null as string | null
  }
})

export const ClickPlacementSystem = defineSystem({
  uuid: 'ee.studio.ClickPlacementSystem',
  insert: { before: TransformSystem },
  reactor: () => {
    Cache.enabled = true

    const clickState = useState(getMutableState(ClickPlacementState))
    const editorState = useState(getMutableState(EditorHelperState))
    const engineState = useState(getMutableState(EngineState))
    const sceneState = useState(getMutableState(SceneState))

    const getParentEntity = () => {
      if (!sceneState.activeScene.value) return null
      const sceneID = sceneState.activeScene.value!
      const scene = SceneState.getScene(sceneID)
      if (!scene) return null
      const entity = UUIDComponent.getEntityByUUID(scene.root)
      return entity
    }

    const createPlacementEntity = (parentEntity: Entity) => {
      const placementEntity = createSceneEntity('Placement', parentEntity, sceneState.activeScene.value!)
      removeComponent(placementEntity, SceneObjectComponent)
      return placementEntity
    }

    const clickListener = () => {
      if (!clickState.selectedAsset.value) return
      const parentEntity = getParentEntity()
      if (!parentEntity) return
      const placementEntity = clickState.placementEntity.value
      if (!placementEntity) return
      setComponent(placementEntity, SceneObjectComponent)
      const snapshot = SceneState.cloneCurrentSnapshot(sceneState.activeScene.value!)
      const uuid = getComponent(placementEntity, UUIDComponent)
      snapshot.data.entities[uuid] = toEntityJson(placementEntity)
      dispatchAction(SceneSnapshotAction.createSnapshot(snapshot))
      if (getState(ObjectGridSnapState).enabled) {
        getMutableState(ObjectGridSnapState).apply.set(true)
      }
      clickState.placementEntity.set(createPlacementEntity(parentEntity))
    }

    useEffect(() => {
      const placementMode = editorState.placementMode.value
      const canvas = EngineRenderer.instance.renderer.domElement
      if (placementMode === PlacementMode.CLICK) {
        canvas.addEventListener('click', clickListener)
      } else {
        canvas.removeEventListener('click', clickListener)
      }
    }, [editorState.placementMode])

    useEffect(() => {
      const parentEntity = getParentEntity()
      if (editorState.placementMode.value === PlacementMode.CLICK) {
        if (!parentEntity) return
        if (clickState.placementEntity.value) return
        clickState.placementEntity.set(createPlacementEntity(parentEntity))
      } else {
        if (!clickState.placementEntity.value) return
        removeEntity(clickState.placementEntity.value)
        clickState.placementEntity.set(null)
      }
    }, [editorState.placementMode, sceneState.activeScene, engineState.sceneLoaded])

    useEffect(() => {
      if (!clickState.selectedAsset.value || !clickState.placementEntity.value) return
      const assetURL = clickState.selectedAsset.get(NO_PROXY)!
      const placementEntity = clickState.placementEntity.value
      if (getOptionalComponent(placementEntity, ModelComponent)?.src === assetURL) return
      setComponent(placementEntity, ModelComponent, { src: assetURL })
    }, [clickState.selectedAsset, clickState.placementEntity])

    return null
  },
  execute: () => {
    const editorHelperState = getState(EditorHelperState)
    if (editorHelperState.placementMode !== PlacementMode.CLICK) return
    const clickState = getState(ClickPlacementState)
    const placementEntity = clickState.placementEntity
    if (!placementEntity) return

    const objectLayerQuery = defineQuery([ObjectLayerComponents[ObjectLayers.Scene]])
    const sceneObjects = objectLayerQuery().flatMap((entity) => getComponent(entity, GroupComponent))
    //const sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Scene] || [])
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    const pointerScreenRaycaster = new Raycaster()

    const mouse = getState(InputState).pointerState.position
    pointerScreenRaycaster.setFromCamera(mouse, camera) // Assuming 'camera' is your Three.js camera

    pointerScreenRaycaster.setFromCamera(mouse, camera) // Assuming 'camera' is your Three.js camera
    const intersect = pointerScreenRaycaster.intersectObjects(sceneObjects, false)
    if (intersect.length === 0) return
    let targetIntersection: Intersection | null = null
    for (let i = 0; i < intersect.length; i++) {
      const intersected = intersect[i]
      if (isPlacementDescendant(intersected.object.entity)) continue
      targetIntersection = intersected
      break
    }
    if (!targetIntersection) return
    const placementTransform = getComponent(placementEntity, TransformComponent)
    const position = targetIntersection.point
    const rotation = new Quaternion().setFromUnitVectors(
      new Vector3(),
      targetIntersection.normal ?? new Vector3(0, 1, 0)
    )
    setComponent(placementEntity, TransformComponent, { position, rotation })
  }
})

const isPlacementDescendant = (entity: Entity) => {
  const placementEntity = getState(ClickPlacementState).placementEntity
  if (!placementEntity) return false
  let walker = entity
  while (walker) {
    if (walker === placementEntity) return true
    walker = getComponent(walker, EntityTreeComponent)?.parentEntity ?? null
  }
  return false
}
