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

import { Intersection, Mesh, Raycaster, Vector2 } from 'three'

import { getContentType } from '@ir-engine/common/src/utils/getContentType'
import {
  defineQuery,
  EntityTreeComponent,
  getAncestorWithComponents,
  getChildrenWithComponents,
  iterateEntityNode,
  removeEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  deserializeComponent,
  getAllComponents,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  LayerID,
  Layers,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { EnvMapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'

import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'
import { serializeEntity } from '@ir-engine/engine/src/scene/functions/serializeWorld'

import { ComponentJsonType } from '@ir-engine/engine/src/scene/types/SceneTypes'

import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { EditorState } from '../services/EditorServices'
import { EditorControlFunctions } from './EditorControlFunctions'
import { getIntersectingNodeOnScreen } from './getIntersectingNode'
import { getIncreamentedName } from './utils'

/**
 * Returns the entity and material index from the intersection
 */
export const getEntityAndMaterialFromIntersection = (intersections: Intersection[]) => {
  const result = {
    entity: UndefinedEntity,
    materialIndex: 0
  }
  for (const intersection of intersections) {
    if (!hasComponent(intersection.object.entity, VisibleComponent)) continue
    iterateEntityNode(intersection.object.entity, (entity: Entity) => {
      if (result.entity) return
      const mesh = getOptionalComponent(entity, MeshComponent)
      if (!mesh || !hasComponent(entity, MaterialInstanceComponent)) return
      let materialIndex = 0
      for (const g of mesh.geometry.groups) {
        if (intersection.faceIndex! * 3 >= g.start && intersection.faceIndex! * 3 < g.start + g.count) {
          materialIndex = g.materialIndex!
          break
        }
      }
      result.entity = entity
      result.materialIndex = materialIndex
    })
  }
  return result
}

/**
 * Replaces the material index on the target entity with the material index from the asset entity
 * @todo this is a placeholder for https://github.com/ir-engine/ir-engine/pull/1912
 */
export const replaceMaterialIndex = (assetEntity: Entity, targetEntity: Entity, materialIndex: number) => {
  const [newMaterialEntity] = getChildrenWithComponents(assetEntity, [MaterialStateComponent])

  /** Reparent the material to the target source */
  const sourceEntity = getAncestorWithComponents(targetEntity, [GLTFComponent])

  const newSourceID = GLTFComponent.getSourceID(sourceEntity)
  setComponent(newMaterialEntity, EntityTreeComponent, { parentEntity: sourceEntity })

  /** Generate a new ID for this entity such that it doesn't collider with others */
  const entityID = UUIDComponent.generate()

  /** Sync UUID */
  setComponent(newMaterialEntity, UUIDComponent, { entitySourceID: newSourceID, entityID: entityID })

  /** Update the material instance component to point to the new material */
  getMutableComponent(targetEntity, MaterialInstanceComponent).entities[materialIndex].set(newMaterialEntity)

  removeEntity(assetEntity)

  AuthoringState.snapshotEntities([targetEntity])
}

export const updateMaterial = (assetEntity: Entity, targetEntity: Entity, materialIndex: number) => {
  const [newMaterialEntity] = getChildrenWithComponents(assetEntity, [MaterialStateComponent])

  const newMaterialComponent = getComponent(newMaterialEntity, MaterialStateComponent)

  const materialInstanceComponent = getComponent(targetEntity, MaterialInstanceComponent)
  const materialEntity = materialInstanceComponent.entities[materialIndex]

  /** If the material is the fallback material, set it to the new material, and update the new material to be in the expected source */
  /** @todo this logic STILL fails, because material instance IDs are not serializable yet */
  if (materialEntity === MaterialStateComponent.fallbackMaterial()) {
    getMutableComponent(targetEntity, MaterialInstanceComponent).entities[materialIndex].set(newMaterialEntity)
    const sourceEntity = UUIDComponent.getSourceEntity(targetEntity)
    UUIDComponent.setSourceEntity(newMaterialEntity, sourceEntity)
    setComponent(newMaterialEntity, EntityTreeComponent, { parentEntity: sourceEntity })
  } else {
    /** Update the material parameters (will be applied to material via authoring state) */
    setComponent(materialEntity, MaterialStateComponent, {
      parameters: newMaterialComponent.parameters
    })

    const materialPluginComponents = getAllComponents(newMaterialEntity).filter(
      (c) =>
        c.jsonID &&
        c !== UUIDComponent &&
        c !== MaterialStateComponent &&
        c !== EntityTreeComponent &&
        c !== NameComponent
    )
    for (const component of materialPluginComponents) {
      deserializeComponent(materialEntity, component, serializeComponent(newMaterialEntity, component))
    }
  }

  removeEntity(assetEntity)

  AuthoringState.snapshotEntities([targetEntity])
}

const allMeshes = defineQuery([VisibleComponent, MeshComponent], Layers.Authoring)

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
  extraComponentJson: ComponentJsonType[] = [],
  screenPosition?: Vector2
): Promise<EntityUUID | null> {
  const contentType = (await getContentType(url)) || ''
  const { hostname } = new URL(url)

  const urlObj = new URL(url)
  const path = urlObj.pathname
  const fileNameWithExtension = path.substring(path.lastIndexOf('/') + 1)
  let requestedName = decodeURI(fileNameWithExtension.split('.')[0])

  if (contentType.startsWith('model/')) {
    if (contentType.startsWith('model/material')) {
      const [inputPointerEntity] = InputPointerComponent.getPointersForCamera(
        getState(ReferenceSpaceState).viewerEntity
      )
      const pointer = getComponent(inputPointerEntity, InputPointerComponent)
      const pointerPosition = screenPosition ?? pointer.position
      const raycaster = new Raycaster()
      const intersections = [] as Intersection[]
      raycaster.setFromCamera(pointerPosition, getComponent(pointer.cameraEntity, CameraComponent))
      raycaster.intersectObjects(allMeshes().map((e) => getComponent(e, MeshComponent)) as Mesh[], true, intersections)
      if (!intersections.length) return null

      getIntersectingNodeOnScreen(raycaster, pointerPosition, intersections)

      const { entity: targetEntity, materialIndex } = getEntityAndMaterialFromIntersection(intersections)

      AssetState.loadAsync(url, false, UUIDComponent.generateUUID(), UndefinedEntity, Layers.Authoring as LayerID).then(
        (entity) => updateMaterial(entity, targetEntity, materialIndex)
      )

      return UUIDComponent.get(targetEntity)
    } else if (contentType.startsWith('model/lookdev')) {
      /**
       * Load the lookdev object and override or attach it to the current scene
       */
      AssetState.loadAsync(url, false, UUIDComponent.generateUUID(), UndefinedEntity, Layers.Authoring as LayerID).then(
        (entity) => {
          const firstChild = getComponent(entity, EntityTreeComponent).children[0]
          const json = serializeEntity(firstChild)

          const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
            [...json, ...extraComponentJson],
            parent!,
            before,
            requestedName
          )

          EditorControlFunctions.overwriteLookdevObject([...json, ...extraComponentJson], parent!, before)
          removeEntity(entity)
          const rootEntity = getState(EditorState).rootEntity
          const newSource = GLTFComponent.getSourceID(rootEntity)
          AuthoringState.snapshot(newSource)

          return entityUUID
        }
      )
    } else if (contentType.startsWith('model/prefab')) {
      /**
       * Load all entities from the prefab and attach them to the current scene
       */
      AssetState.loadAsync(url, false, UUIDComponent.generate(), UndefinedEntity, Layers.Authoring as LayerID).then(
        (entity) => {
          const rootEntity = getState(EditorState).rootEntity
          const source = UUIDComponent.getAsSourceID(entity)
          const entities = UUIDComponent.getEntitiesBySource(source, Layers.Authoring)
          const newSource = GLTFComponent.getSourceID(rootEntity)
          for (const entity of entities) {
            requestedName = getIncreamentedName(requestedName, parent)
            setComponent(entity, NameComponent, requestedName)

            const sourceID = GLTFComponent.getSourceID(rootEntity)
            const entityID = UUIDComponent.generate()
            setComponent(entity, UUIDComponent, { entitySourceID: sourceID, entityID })

            for (const comp of extraComponentJson) {
              if (comp.name === TransformComponent.jsonID) {
                setComponent(entity, TransformComponent, comp.props)
              }
            }
          }
          for (const childEntity of getComponent(entity, EntityTreeComponent).children) {
            setComponent(childEntity, EntityTreeComponent, { parentEntity: parent ?? rootEntity })
            if (hasComponent(childEntity, TransformComponent)) TransformComponent.computeTransformMatrix(childEntity)
          }
          removeEntity(entity)
          const gltfEntity = getAncestorWithComponents(parent ?? rootEntity, [GLTFComponent])
          EditorState.markModifiedScene(gltfEntity)
          AuthoringState.snapshot(newSource)
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

      const rootEntity = getState(EditorState).rootEntity
      const newSource = UUIDComponent.getAsSourceID(rootEntity)
      AuthoringState.snapshot(newSource)
      return entityUUID
    }
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [
        { name: TransformComponent.jsonID },
        { name: VideoComponent.jsonID },
        { name: PositionalAudioComponent.jsonID },
        { name: MediaComponent.jsonID, props: { resources: [url] } },
        ...extraComponentJson
      ],
      parent!,
      before,
      requestedName
    )
    const rootEntity = getState(EditorState).rootEntity
    const newSource = UUIDComponent.getAsSourceID(rootEntity)
    AuthoringState.snapshot(newSource)
    return entityUUID
  } else if (contentType.startsWith('image/')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [{ name: ImageComponent.jsonID, props: { source: url } }, ...extraComponentJson],
      parent!,
      before,
      requestedName
    )
    const rootEntity = getState(EditorState).rootEntity
    const newSource = UUIDComponent.getAsSourceID(rootEntity)
    AuthoringState.snapshot(newSource)
    return entityUUID
  } else if (contentType.startsWith('audio/')) {
    const { entityUUID } = EditorControlFunctions.createObjectFromSceneElement(
      [{ name: MediaComponent.jsonID, props: { resources: [url] } }, ...extraComponentJson],
      parent!,
      before,
      requestedName
    )
    const rootEntity = getState(EditorState).rootEntity
    const newSource = UUIDComponent.getAsSourceID(rootEntity)
    AuthoringState.snapshot(newSource)
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
    const rootEntity = getState(EditorState).rootEntity
    const newSource = UUIDComponent.getAsSourceID(rootEntity)
    AuthoringState.snapshot(newSource)
    return entityUUID
  }
  return null
}
