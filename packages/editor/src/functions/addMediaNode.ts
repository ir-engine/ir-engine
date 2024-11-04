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

import { Intersection, Material, Mesh, Raycaster, Vector2 } from 'three'

import { getContentType } from '@ir-engine/common/src/utils/getContentType'
import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { AssetLoaderState } from '@ir-engine/engine/src/assets/state/AssetLoaderState'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { EnvmapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'
import { createLoadingSpinner } from '@ir-engine/engine/src/scene/functions/spatialLoadingSpinner'
import { ComponentJsonType } from '@ir-engine/engine/src/scene/types/SceneTypes'
import { getState, startReactor, useImmediateEffect } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import iterateObject3D from '@ir-engine/spatial/src/common/functions/iterateObject3D'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayerComponents } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks, ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { assignMaterial, createMaterialEntity } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { removeEntityNodeRecursively } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { EditorState } from '../services/EditorServices'
import { EditorControlFunctions } from './EditorControlFunctions'
import { getIntersectingNodeOnScreen } from './getIntersectingNode'

/**
 * Adds media node from passed url. Type of the media will be detected automatically
 * @param url URL of the passed media
 * @param parent Parent node will be set as parent to newly created node
 * @param before Newly created node will be set before this node in parent's children array
 * @returns Newly created media node
 */

export async function addMediaNode(
  url: string,
  parent?: Entity,
  before?: Entity,
  extraComponentJson: ComponentJsonType[] = []
): Promise<EntityUUID | null> {
  const contentType = (await getContentType(url)) || ''
  const { hostname } = new URL(url)

  if (contentType.startsWith('model/')) {
    if (contentType.startsWith('model/material')) {
      // find current intersected object
      const objectLayerQuery = defineQuery([ObjectLayerComponents[ObjectLayers.Scene]])
      const sceneObjects = objectLayerQuery().flatMap((entity) => getComponent(entity, GroupComponent))
      //const sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Scene] || [])
      const mouse = new Vector2()
      const mouseEvent = event as MouseEvent // Type assertion
      const element = mouseEvent.target as HTMLElement
      let rect = element.getBoundingClientRect()
      mouse.x = ((mouseEvent.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((mouseEvent.clientY - rect.top) / rect.height) * 2 + 1
      const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
      const raycaster = new Raycaster()
      raycaster.layers.set(ObjectLayerMasks[ObjectLayers.Scene])
      const intersections = [] as Intersection[]
      getIntersectingNodeOnScreen(raycaster, mouse, intersections)
      // debug code for visualizing ray casts:
      // const rayEntity = createSceneEntity("ray helper", getState(EditorState).rootEntity)
      // const lineStart = raycaster.ray.origin
      // const lineEnd = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(1000))
      // const lineGeometry = new BufferGeometry().setFromPoints([lineStart, lineEnd])
      // setComponent(rayEntity, LineSegmentComponent, { geometry: lineGeometry })
      const gltfLoader = getState(AssetLoaderState).gltfLoader
      return await new Promise((resolve) =>
        gltfLoader.load(url, (gltf) => {
          const material = iterateObject3D(
            gltf.scene,
            (mesh: Mesh) => mesh.material as Material,
            (mesh: Mesh) => mesh?.isMesh
          )[0]
          if (!material) return
          const materialEntity = createMaterialEntity(material)
          let foundTarget = false
          for (const intersection of intersections) {
            iterateObject3D(intersection.object, (mesh: Mesh) => {
              if (!mesh?.isMesh || !mesh.visible) return
              assignMaterial(mesh.entity, materialEntity)
              foundTarget = true
            })
            if (foundTarget) break
          }
          resolve(getComponent(materialEntity, UUIDComponent))
        })
      )
    } else if (contentType.startsWith('model/lookdev')) {
      const gltfLoader = getState(AssetLoaderState).gltfLoader
      const spinnerEntity = createLoadingSpinner('lookdev loading spinner', getState(EditorState).rootEntity)
      return await new Promise((resolve) =>
        gltfLoader.load(url, (gltf) => {
          try {
            let componentJson = [] as ComponentJsonType[]
            gltf.scene.children.forEach((child) => {
              componentJson.push(child.userData.componentJson)
            })
            const mergedComponentJsonArray = componentJson.flat()
            EditorControlFunctions.overwriteLookdevObject(
              [{ name: ModelComponent.jsonID, props: { src: url } }, ...extraComponentJson],
              mergedComponentJsonArray,
              parent!,
              before
            )
            removeEntityNodeRecursively(spinnerEntity)
            resolve(null)
          } catch (error) {
            removeEntityNodeRecursively(spinnerEntity)
          }
        })
      )
    } else if (contentType.startsWith('model/prefab')) {
      const { entityUUID, sceneID } = EditorControlFunctions.createObjectFromSceneElement(
        [{ name: ModelComponent.jsonID, props: { src: url } }, ...extraComponentJson],
        parent!,
        before
      )
      const reactor = startReactor(() => {
        const entity = UUIDComponent.useEntityByUUID(entityUUID)
        const modelComponent = useOptionalComponent(entity, ModelComponent)

        useImmediateEffect(() => {
          if (!modelComponent) return

          modelComponent.dereference.set(true)
          reactor.stop()
        }, [modelComponent])

        return null
      })
      return entityUUID
    } else {
      const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
        [
          { name: ModelComponent.jsonID, props: { src: url } },
          { name: ShadowComponent.jsonID },
          { name: EnvmapComponent.jsonID },
          ...extraComponentJson
        ],
        parent!,
        before
      )
      return entityUUID
    }
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: VideoComponent.jsonID },
        { name: PositionalAudioComponent.jsonID },
        { name: MediaComponent.jsonID, props: { resources: [url] } },
        ...extraComponentJson
      ],
      parent!,
      before
    )
    return entityUUID
  } else if (contentType.startsWith('image/')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [{ name: ImageComponent.jsonID, props: { source: url } }, ...extraComponentJson],
      parent!,
      before
    )
    return entityUUID
  } else if (contentType.startsWith('audio/')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: PositionalAudioComponent.jsonID },
        { name: MediaComponent.jsonID, props: { resources: [url] } },
        ...extraComponentJson
      ],
      parent!,
      before
    )
    return entityUUID
  } else if (url.includes('.uvol')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: VolumetricComponent.jsonID },
        { name: MediaComponent.jsonID, props: { resources: [url] } },
        ...extraComponentJson
      ],
      parent!,
      before
    )
    return entityUUID
  } else {
    return null
  }
}
