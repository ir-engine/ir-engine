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
import { Ray } from '@dimforge/rapier3d-compat'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import {
  Engine,
  Entity,
  UUIDComponent,
  UndefinedEntity,
  defineQuery,
  defineSystem,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { AssetExt, FileToAssetExt } from '@ir-engine/engine/src/assets/constants/AssetType'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GLTFDocumentState, GLTFSnapshotAction } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { GLTFSnapshotState } from '@ir-engine/engine/src/gltf/GLTFState'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { entityJSONToGLTFNode } from '@ir-engine/engine/src/scene/functions/GLTFConversion'
import { createSceneEntity } from '@ir-engine/engine/src/scene/functions/createSceneEntity'
import { getModelSceneID } from '@ir-engine/engine/src/scene/functions/loaders/ModelFunctions'
import { toEntityJson } from '@ir-engine/engine/src/scene/functions/serializeWorld'
import {
  NO_PROXY,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  useHookstate,
  useState
} from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { MouseScroll } from '@ir-engine/spatial/src/input/state/ButtonState'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerComponents } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { HolographicMaterial } from '@ir-engine/spatial/src/renderer/materials/prototypes/HolographicMaterial.mat'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformDirtyCleanupSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import React, { useEffect } from 'react'
import { Euler, Material, Mesh, Quaternion, Raycaster, Vector3 } from 'three'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import { EditorHelperState, PlacementMode } from '../services/EditorHelperState'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'
import { ObjectGridSnapState } from './ObjectGridSnapSystem'

let placedCount = 0
export const ClickPlacementState = defineState({
  name: 'ClickPlacementState',
  initial: {
    placementEntity: UndefinedEntity as Entity,
    selectedAsset: '',
    yawOffset: 0,
    pitchOffset: 0,
    rollOffset: 0,
    maxDistance: 25,
    materialCache: [] as [Mesh, Material][]
  },
  setSelectedAsset: (src: string) => {
    const assetExt = FileToAssetExt(src)
    if (assetExt && (assetExt === AssetExt.GLTF || assetExt === AssetExt.GLB))
      getMutableState(ClickPlacementState).selectedAsset.set(src)
    else {
      // If in click placement mode and non-placeable asset was selected, show warning
      if (getState(EditorHelperState).placementMode === PlacementMode.CLICK) {
        ClickPlacementState.assetError()
      } else ClickPlacementState.resetSelectedAsset()
    }
  },
  resetSelectedAsset: () => {
    getMutableState(ClickPlacementState).selectedAsset.set('')
  },
  assetError: () => {
    NotificationService.dispatchNotify('Selected asset is not valid for click placement', { variant: 'warning' })
    ClickPlacementState.resetSelectedAsset()
  }
})

const ClickPlacementReactor = (props: { parentEntity: Entity }) => {
  const { parentEntity } = props
  const clickState = useState(getMutableState(ClickPlacementState))
  const editorState = useState(getMutableState(EditorHelperState))
  const sceneLoaded = GLTFComponent.useSceneLoaded(parentEntity)
  const errors = ErrorComponent.useComponentErrors(clickState.placementEntity.value, ModelComponent)

  // const renderers = defineQuery([RendererComponent])

  // useEffect(() => {
  //   const placementMode = editorState.placementMode.value
  //   const renderer = getComponent(renderers()[0], RendererComponent)
  //   const canvas = renderer.canvas
  //   if (placementMode === PlacementMode.CLICK) {
  //     canvas.addEventListener('click', clickListener)
  //   } else {
  //     canvas.removeEventListener('click', clickListener)
  //   }
  // }, [editorState.placementMode])

  useEffect(() => {
    if (!sceneLoaded) return
    if (editorState.placementMode.value === PlacementMode.CLICK) {
      SelectionState.updateSelection([])
      if (clickState.placementEntity.value) return
      clickState.placementEntity.set(createPlacementEntity(parentEntity))
    } else {
      if (!clickState.placementEntity.value) return
      const selectedEntities = getState(SelectionState).selectedEntities.filter(
        (uuid) => uuid !== getComponent(clickState.placementEntity.value, UUIDComponent)
      )
      EditorControlFunctions.removeObject([clickState.placementEntity.value])
      clickState.placementEntity.set(UndefinedEntity)
      SelectionState.updateSelection(selectedEntities)
    }
  }, [editorState.placementMode, sceneLoaded])

  useEffect(() => {
    if (!clickState.placementEntity.value) return
    const assetURL = clickState.selectedAsset.get(NO_PROXY)
    const placementEntity = clickState.placementEntity.value
    if (getComponent(placementEntity, ModelComponent)?.src === assetURL) return
    updatePlacementEntitySnapshot(placementEntity)
  }, [clickState.selectedAsset, clickState.placementEntity])

  useEffect(() => {
    if (!errors || !errors.value) return
    ClickPlacementState.assetError()
  }, [errors])

  return (
    <PlacementModelReactor key={clickState.placementEntity.value} placementEntity={clickState.placementEntity.value} />
  )
}

const PlacementModelReactor = (props: { placementEntity: Entity }) => {
  const clickState = useState(getMutableState(ClickPlacementState))
  const sceneState = useHookstate(getMutableState(GLTFDocumentState))
  const placementModel = useOptionalComponent(props.placementEntity, ModelComponent)

  useEffect(() => {
    if (!placementModel) return
    const sceneID = getModelSceneID(props.placementEntity)
    if (!sceneState.scenes[sceneID]) return
    iterateEntityNode(props.placementEntity, (entity) => {
      const mesh = getOptionalComponent(entity, MeshComponent)
      if (!mesh) return
      const material = mesh.material as Material
      clickState.materialCache.set((prev) => [...prev, [mesh, material]])
      mesh.material = new HolographicMaterial({})
    })
  }, [placementModel?.scene, sceneState.scenes.keys])

  return null
}

const objectLayerQuery = defineQuery([ObjectLayerComponents[ObjectLayers.Scene]])

const getParentEntity = () => {
  return getState(EditorState).rootEntity
}

const updatePlacementEntitySnapshot = (placementEntity: Entity) => {
  const selectedAsset = getState(ClickPlacementState).selectedAsset
  if (selectedAsset) setComponent(placementEntity, ModelComponent, { src: getState(ClickPlacementState).selectedAsset })
  else removeComponent(placementEntity, ModelComponent)

  const sceneID = getComponent(placementEntity, SourceComponent)
  const snapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
  const uuid = getComponent(placementEntity, UUIDComponent)
  const nodeIndex = snapshot.data.nodes!.findIndex(
    (value) => value.extensions && value.extensions[UUIDComponent.jsonID] === uuid
  )
  const entityJson = toEntityJson(placementEntity)
  const entityGLTFNode = entityJSONToGLTFNode(entityJson, uuid)
  delete entityGLTFNode.matrix
  snapshot.data.nodes![nodeIndex] = entityGLTFNode
  dispatchAction(GLTFSnapshotAction.createSnapshot(snapshot))
}

const createPlacementEntitySnapshot = (placementEntity: Entity) => {
  setComponent(placementEntity, ModelComponent, { src: getState(ClickPlacementState).selectedAsset })
  const sceneID = getComponent(placementEntity, SourceComponent)
  const snapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
  const uuid = getComponent(placementEntity, UUIDComponent)
  const entityJson = toEntityJson(placementEntity)
  const entityGLTFNode = entityJSONToGLTFNode(entityJson, uuid)
  delete entityGLTFNode.matrix
  const nodeIndex = snapshot.data.nodes!.length
  snapshot.data.nodes!.push(entityGLTFNode)
  snapshot.data.scenes![0].nodes.push(nodeIndex)
  dispatchAction(GLTFSnapshotAction.createSnapshot(snapshot))
}

const createPlacementEntity = (parentEntity: Entity) => {
  const placementEntity = createSceneEntity('Placement-' + placedCount, parentEntity)

  const sceneID = getComponent(parentEntity, SourceComponent)
  setComponent(placementEntity, SourceComponent, sceneID)
  setComponent(placementEntity, EntityTreeComponent, { parentEntity })
  createPlacementEntitySnapshot(placementEntity)

  return placementEntity
}

const clickListener = () => {
  const clickState = getMutableState(ClickPlacementState)
  if (!clickState.selectedAsset.value) return
  const parentEntity = getParentEntity()
  if (!parentEntity) return
  const placementEntity = clickState.placementEntity.value
  if (!placementEntity) return

  if (getState(ObjectGridSnapState).enabled) {
    ObjectGridSnapState.apply()
  } else {
    TransformComponent.updateFromWorldMatrix(placementEntity)
    EditorControlFunctions.commitTransformSave([placementEntity])
  }
  placedCount += 1
  clickState.placementEntity.set(createPlacementEntity(parentEntity))
  for (const [mesh, material] of clickState.materialCache.value as [Mesh, Material][]) {
    mesh.material = material
  }
  clickState.materialCache.set([])
}

export const ClickPlacementSystem = defineSystem({
  uuid: 'ee.studio.ClickPlacementSystem',
  insert: { after: TransformDirtyCleanupSystem },
  reactor: () => {
    const parentEntity = useHookstate(getMutableState(EditorState)).rootEntity

    return parentEntity.value ? (
      <ClickPlacementReactor key={parentEntity.value} parentEntity={parentEntity.value} />
    ) : null
  },
  execute: () => {
    const editorHelperState = getState(EditorHelperState)
    if (editorHelperState.placementMode !== PlacementMode.CLICK) return
    const clickState = getMutableState(ClickPlacementState)
    const placementEntity = clickState.placementEntity
    if (!placementEntity) return

    const editorEntity = getState(EditorState).rootEntity
    const physicsWorld = Physics.getWorld(editorEntity)
    if (!physicsWorld) return

    //@todo: fix type of `typeof GroupComponent`
    const sceneObjects: any[] = []
    const candidates = objectLayerQuery()
    for (const entity of candidates) {
      const obj = getComponent(entity, GroupComponent)?.[0]
      !!obj && sceneObjects.push(obj)
    }
    //const sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Scene] || [])
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    const pointerScreenRaycaster = new Raycaster()

    let intersectEntity: Entity = UndefinedEntity
    let targetIntersection: { point: Vector3; normal: Vector3 } | null = null

    const viewerEntity = Engine.instance.viewerEntity
    const mouseEntity = InputPointerComponent.getPointersForCamera(viewerEntity)[0]
    if (!mouseEntity) return

    const buttons = InputComponent.getMergedButtons(viewerEntity)
    const axes = InputComponent.getMergedAxes(viewerEntity)

    const zoom = axes[MouseScroll.VerticalScroll]

    if (buttons.SecondaryClick?.pressed) {
      clickState.maxDistance.set(clickState.maxDistance.value - zoom)
    }

    if (buttons.KeyE?.up) {
      clickState.yawOffset.set(clickState.yawOffset.value + Math.PI / 4)
    }
    if (buttons.KeyQ?.up) {
      clickState.yawOffset.set(clickState.yawOffset.value - Math.PI / 4)
    }
    if (buttons.PrimaryClick?.up) {
      clickListener()
      //Wait until next frame is placement entity changed
      if (placementEntity !== clickState.placementEntity) return
    }

    const pointer = getComponent(mouseEntity, InputPointerComponent)
    const mouse = pointer.position
    pointerScreenRaycaster.setFromCamera(mouse, camera) // Assuming 'camera' is your Three.js camera
    const cameraPosition = pointerScreenRaycaster.ray.origin
    const cameraDirection = pointerScreenRaycaster.ray.direction
    const physicsIntersection = physicsWorld.castRayAndGetNormal(new Ray(cameraPosition, cameraDirection), 1000, false)
    if (physicsIntersection && physicsIntersection.toi < clickState.maxDistance.value) {
      const intersectPosition = cameraPosition
        .clone()
        .add(cameraDirection.clone().multiplyScalar(physicsIntersection.toi))
      intersectEntity = physicsIntersection.collider.parent()!.entity
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
    //if (intersect.length === 0 && !targetIntersection) return
    for (let i = 0; i < intersect.length; i++) {
      const intersected = intersect[i]
      if (intersected.distance > clickState.maxDistance.value) continue
      if (isPlacementDescendant(intersected.object.entity)) continue
      targetIntersection = {
        point: intersected.point,
        normal: intersected.face?.normal ?? new Vector3(0, 1, 0)
      }
      break
    }

    if (!targetIntersection) {
      const point = cameraPosition.clone().add(cameraDirection.clone().multiplyScalar(clickState.maxDistance.value))
      targetIntersection = { point, normal: new Vector3(0, 1, 0) }
    }
    const position = targetIntersection.point
    let rotation = new Quaternion().setFromUnitVectors(new Vector3(), targetIntersection.normal ?? new Vector3(0, 1, 0))
    const offset = new Quaternion().setFromEuler(
      new Euler(clickState.pitchOffset.value, clickState.yawOffset.value, clickState.rollOffset.value)
    )
    rotation = offset.multiply(rotation)
    setComponent(placementEntity.value, TransformComponent, { position, rotation })
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
