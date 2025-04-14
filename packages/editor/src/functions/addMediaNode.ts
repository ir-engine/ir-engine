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

import { Intersection, Raycaster, Vector2 } from 'three'

import { getContentType } from '@ir-engine/common/src/utils/getContentType'
import {
  EntityTreeComponent,
  getAncestorWithComponents,
  getChildrenWithComponents,
  iterateEntityNode,
  removeEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  LayerID,
  Layers,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { EnvMapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'
import { serializeEntity } from '@ir-engine/engine/src/scene/functions/serializeWorld'
import { SceneDeltaState } from '@ir-engine/engine/src/scene/systems/SceneDeltaState'
import { ComponentJsonType } from '@ir-engine/engine/src/scene/types/SceneTypes'
import { getState, none } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks, ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import {
  MaterialInstanceComponent,
  MaterialPrototypeDefinitions,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { EditorHistoryFunctions } from '../services/EditorHistoryState'
import { EditorState } from '../services/EditorServices'
import { EditorControlFunctions } from './EditorControlFunctions'
import { getIntersectingNodeOnScreen } from './getIntersectingNode'
import { getIncreamentedName } from './utils'

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

  const urlObj = new URL(url)
  const path = urlObj.pathname
  const fileNameWithExtension = path.substring(path.lastIndexOf('/') + 1)
  let requestedName = decodeURI(fileNameWithExtension.split('.')[0])

  if (contentType.startsWith('model/')) {
    if (contentType.startsWith('model/material')) {
      // find current intersected object
      // const objectLayerQuery = defineQuery([ObjectLayerComponents[ObjectLayers.Scene]])
      // const sceneObjects = objectLayerQuery().flatMap((entity) => getComponent(entity, ObjectComponent))
      //const sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Scene] || [])
      const mouse = new Vector2()
      const mouseEvent = event as MouseEvent // Type assertion
      const element = mouseEvent.target as HTMLElement
      const rect = element.getBoundingClientRect()
      mouse.x = ((mouseEvent.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((mouseEvent.clientY - rect.top) / rect.height) * 2 + 1
      // const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
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

      AssetState.loadAsync(url, false, UUIDComponent.generateUUID(), UndefinedEntity, Layers.Authoring as LayerID).then(
        (assetEntity) => {
          const [material] = getChildrenWithComponents(assetEntity, [MaterialStateComponent])
          let foundTarget = false
          for (const intersection of intersections) {
            if (!hasComponent(intersection.object.entity, VisibleComponent)) continue

            iterateEntityNode(intersection.object.entity, (entity: Entity) => {
              const mesh = getOptionalComponent(entity, MeshComponent)
              if (!mesh) return
              let materialIndex = 0
              for (const g of mesh.geometry.groups) {
                if (intersection.faceIndex! * 3 >= g.start && intersection.faceIndex! * 3 < g.start + g.count) {
                  materialIndex = g.materialIndex!
                  break
                }
              }
              const uuids = getComponent(entity, MaterialInstanceComponent).uuid

              /**@todo we should be setting the uuid of the material instance component to the uuid of the new material */
              //const materialUUID = getComponent(material, UUIDComponent)
              //uuids[materialIndex] = materialUUID,
              //setComponent(entity, MaterialInstanceComponent, { uuid: uuids })
              /**scene deltas do not yet support this, so a temporary hackfix is to modify existing materials to match */
              const materialComponent = getComponent(material, MaterialStateComponent)
              const materialToMutate = UUIDComponent.getEntityByUUID(uuids[materialIndex], Layers.Authoring)
              // wipe out any existing deltas for this material
              const existingDelta =
                SceneDeltaState.getSource(materialToMutate)?.[getComponent(materialToMutate, NodeIDComponent)]
              if (existingDelta.value) {
                //another hack
                const mat = getComponent(materialToMutate, MaterialStateComponent).material
                const constructor =
                  getState(MaterialPrototypeDefinitions)[mat.userData?.type || mat.type].prototypeConstructor
                getMutableComponent(materialToMutate, MaterialStateComponent).material.set(new constructor())
                existingDelta.set(none)
              }
              EditorControlFunctions.updateMaterialPrototype(
                materialToMutate,
                materialComponent.material.userData?.type ?? materialComponent.material.type
              )
              EditorControlFunctions.modifyMaterial([uuids[materialIndex]], uuids[materialIndex], [
                getComponent(material, MaterialStateComponent).parameters
              ])
              removeEntity(assetEntity)
              foundTarget = true
            })
            if (foundTarget) break
          }
        }
      )
    } else if (contentType.startsWith('model/lookdev')) {
      /**
       * Load the lookdev object and override or attach it to the current scene
       */
      AssetState.loadAsync(url, false, UUIDComponent.generateUUID(), UndefinedEntity, Layers.Authoring as LayerID).then(
        (entity) => {
          const firstChild = getComponent(entity, EntityTreeComponent).children[0]
          const json = serializeEntity(firstChild)
          EditorControlFunctions.overwriteLookdevObject([...json, ...extraComponentJson], parent!, before)
          removeEntity(entity)
          EditorHistoryFunctions.snapshot()
        }
      )
    } else if (contentType.startsWith('model/prefab')) {
      /**
       * Load all entities from the prefab and attach them to the current scene
       */
      AssetState.loadAsync(url, false, UUIDComponent.generateUUID(), UndefinedEntity, Layers.Authoring as LayerID).then(
        (entity) => {
          const currentSource = GLTFComponent.getInstanceID(entity)
          const entities = SourceComponent.getEntitiesBySource(currentSource, Layers.Authoring)
          const rootEntity = getState(EditorState).rootEntity
          const newSource = GLTFComponent.getInstanceID(rootEntity)
          for (const entity of entities) {
            requestedName = getIncreamentedName(requestedName, parent)
            setComponent(entity, NameComponent, requestedName)
            setComponent(entity, SourceComponent, newSource)
            setComponent(entity, NodeIDComponent, NodeIDComponent.generate())
            setComponent(
              entity,
              UUIDComponent,
              NodeIDComponent.getUUIDBySourceAndNodeID(newSource, getComponent(entity, NodeIDComponent))
            )
          }
          for (const childEntity of getComponent(entity, EntityTreeComponent).children) {
            setComponent(childEntity, EntityTreeComponent, { parentEntity: parent ?? rootEntity })
          }
          removeEntity(entity)
          const gltfEntity = getAncestorWithComponents(parent ?? rootEntity, [GLTFComponent])
          EditorState.markModifiedScene(gltfEntity)
          EditorHistoryFunctions.snapshot()
        }
      )
    } else {
      const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
        [
          { name: GLTFComponent.jsonID, props: { src: url } },
          { name: ShadowComponent.jsonID },
          { name: EnvMapComponent.jsonID },
          ...extraComponentJson
        ],
        parent!,
        before,
        requestedName
      )
      EditorHistoryFunctions.snapshot()
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
      before,
      requestedName
    )
    EditorHistoryFunctions.snapshot()
    return entityUUID
  } else if (contentType.startsWith('image/')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [{ name: ImageComponent.jsonID, props: { source: url } }, ...extraComponentJson],
      parent!,
      before,
      requestedName
    )
    EditorHistoryFunctions.snapshot()
    return entityUUID
  } else if (contentType.startsWith('audio/')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [{ name: MediaComponent.jsonID, props: { resources: [url] } }, ...extraComponentJson],
      parent!,
      before,
      requestedName
    )
    EditorHistoryFunctions.snapshot()
    return entityUUID
  } else if (url.includes('.uvol')) {
    // TODO: detect whether to add LegacyVolumetricComponent or VolumetricComponent
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: VolumetricComponent.jsonID },
        { name: MediaComponent.jsonID, props: { resources: [url] } },
        ...extraComponentJson
      ],
      parent!,
      before,
      requestedName
    )
    EditorHistoryFunctions.snapshot()
    return entityUUID
  }
  return null
}
