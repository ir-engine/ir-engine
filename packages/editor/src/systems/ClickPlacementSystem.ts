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
import { Ray } from '@dimforge/rapier3d-compat'
import { SceneID } from '@etherealengine/common/src/schema.type.module'
import {
  Engine,
  Entity,
  UUIDComponent,
  UndefinedEntity,
  defineQuery,
  defineSystem,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { SceneSnapshotState, SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { createSceneEntity } from '@etherealengine/engine/src/scene/functions/createSceneEntity'
import { toEntityJson } from '@etherealengine/engine/src/scene/functions/serializeWorld'
import { NO_PROXY, defineState, getMutableState, getState, useState } from '@etherealengine/hyperflux'
import { TransformComponent, TransformSystem } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayerComponents } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { Cache, Quaternion, Raycaster, Vector3 } from 'three'
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

    const renderers = defineQuery([RendererComponent])

    const getParentEntity = () => {
      if (!sceneState.scenes.value) return null
      const sceneID = sceneState.scenes.keys[0] as SceneID
      const scene = SceneState.getScene(sceneID)
      if (!scene) return null
      const entity = UUIDComponent.getEntityByUUID(scene.scene.root)
      return entity
    }

    const createPlacementEntity = (parentEntity: Entity) => {
      const placementEntity = createSceneEntity('Placement', parentEntity)
      //removeComponent(placementEntity, SourceComponent)
      return placementEntity
    }

    const clickListener = () => {
      if (!clickState.selectedAsset.value) return
      const parentEntity = getParentEntity()
      if (!parentEntity) return
      const placementEntity = clickState.placementEntity.value
      if (!placementEntity) return
      const sceneID = getComponent(parentEntity, SourceComponent)
      //setComponent(placementEntity, SourceComponent, sceneID)
      setComponent(placementEntity, EntityTreeComponent, { parentEntity })
      const snapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)
      const uuid = getComponent(placementEntity, UUIDComponent)
      snapshot.data.entities[uuid] = toEntityJson(placementEntity)

      //dispatchAction(SceneSnapshotAction.createSnapshot(snapshot))
      if (getState(ObjectGridSnapState).enabled) {
        getMutableState(ObjectGridSnapState).apply.set(true)
      }
      clickState.placementEntity.set(createPlacementEntity(parentEntity))
    }

    useEffect(() => {
      const placementMode = editorState.placementMode.value
      const renderer = getComponent(renderers()[0], RendererComponent)
      const canvas = renderer.canvas
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
    }, [editorState.placementMode, sceneState.sceneLoaded])

    useEffect(() => {
      if (!clickState.selectedAsset.value || !clickState.placementEntity.value) return
      const assetURL = clickState.selectedAsset.get(NO_PROXY)!
      const placementEntity = clickState.placementEntity.value
      if (getOptionalComponent(placementEntity, ModelComponent)?.src === assetURL) return
      setComponent(placementEntity, ModelComponent, { src: assetURL })
      // return () => {
      //   removeEntity(placementEntity)
      // }
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

    const physicsWorld = getState(PhysicsState).physicsWorld

    let intersectEntity: Entity = UndefinedEntity
    let targetIntersection: { point: Vector3; normal: Vector3 } | null = null

    const mouseEntity = InputPointerComponent.getPointerForCanvas(Engine.instance.viewerEntity)
    if (!mouseEntity) return
    const mouse = getComponent(mouseEntity, InputPointerComponent).position
    pointerScreenRaycaster.setFromCamera(mouse, camera) // Assuming 'camera' is your Three.js camera
    const cameraPosition = pointerScreenRaycaster.ray.origin
    const cameraDirection = pointerScreenRaycaster.ray.direction
    const physicsIntersection = physicsWorld.castRayAndGetNormal(new Ray(cameraPosition, cameraDirection), 1000, false)
    if (physicsIntersection) {
      const intersectPosition = cameraPosition
        .clone()
        .add(cameraDirection.clone().multiplyScalar(physicsIntersection.toi))
      intersectEntity = (physicsIntersection.collider.parent() as { userData: { entity: Entity } }).userData.entity
      const intersectNormal = new Vector3(
        physicsIntersection.normal.x,
        physicsIntersection.normal.y,
        physicsIntersection.normal.z
      )
      targetIntersection = {
        point: intersectPosition,
        normal: intersectNormal
      }
    }
    const intersect = pointerScreenRaycaster.intersectObjects(sceneObjects, false)
    if (intersect.length === 0 && !targetIntersection) return
    for (let i = 0; i < intersect.length; i++) {
      const intersected = intersect[i]
      if (isPlacementDescendant(intersected.object.entity)) continue
      targetIntersection = {
        point: intersected.point,
        normal: intersected.face?.normal ?? new Vector3(0, 1, 0)
      }
      break
    }
    if (!targetIntersection || !placementEntity) return
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
