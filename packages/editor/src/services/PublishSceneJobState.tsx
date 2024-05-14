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

import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { LocationData, LocationID, locationPath } from '@etherealengine/common/src/schema.type.module'
import {
  Entity,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useQuery
} from '@etherealengine/ecs'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { proxifyParentChildRelationships } from '@etherealengine/engine/src/scene/functions/loadGLTFModel'
import { defineState, getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { Group, Quaternion } from 'three'
import { Vector3 } from 'three/src/math/Vector3'
import exportGLTF from '../functions/exportGLTF'

const createTempEntity = (name: string, parentEntity: Entity = UndefinedEntity): Entity => {
  const entity = createEntity()
  setComponent(entity, NameComponent, name)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity })

  let sceneID = getState(EditorState).scenePath!
  if (hasComponent(parentEntity, SourceComponent)) {
    sceneID = getComponent(parentEntity, SourceComponent)
  }
  setComponent(entity, SourceComponent, sceneID)

  const uuid = generateEntityUUID()
  setComponent(entity, UUIDComponent, uuid)

  // These additional properties and relations are required for
  // the current GLTF exporter to successfully generate a GLTF.
  const obj3d = new Group()
  obj3d.entity = entity
  addObjectToGroup(entity, obj3d)
  proxifyParentChildRelationships(obj3d)
  setComponent(entity, Object3DComponent, obj3d)

  return entity
}

type PublishJob = Record<
  string,
  {
    locationName: string
  }
>

export const PublishJobState = defineState({
  name: 'PublishJobState',
  initial: {} as PublishJob,
  reactor: () => {
    const state = useHookstate(getMutableState(PublishJobState))
    return (
      <>
        {state.keys.map((key) => (
          <PublishJobReactor key={key} locationName={key} />
        ))}
      </>
    )
  }
})

export const publishScene = (locationName: string) => {
  getMutableState(PublishJobState)[locationName].set({
    locationName
  })
}

const makeBaseModel = (): Entity => {
  const result = createTempEntity('published-scene-bake')
  setComponent(result, ModelComponent)
  return result
}

const findParentModel = (entity: Entity): Entity | null => {
  let parentEntity = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity
  while (parentEntity != null) {
    if (hasComponent(parentEntity, ModelComponent)) {
      return parentEntity
    }
    parentEntity = getOptionalComponent(parentEntity, EntityTreeComponent)?.parentEntity
  }
  return null
}

const reparentMesh = (meshEntity: Entity, parentEntity: Entity) => {
  const worldPos = TransformComponent.getWorldPosition(meshEntity, new Vector3())
  const worldRot = TransformComponent.getWorldRotation(meshEntity, new Quaternion())
  const worldScale = TransformComponent.getWorldScale(meshEntity, new Vector3())

  setComponent(meshEntity, EntityTreeComponent, { parentEntity })

  TransformComponent.setWorldPosition(meshEntity, worldPos)
  TransformComponent.getWorldRotation(meshEntity, worldRot)
  TransformComponent.getWorldScale(meshEntity, worldScale)
}

const exportTransformAndReloadModel = async (modelEntity: Entity) => {
  const newURL = `baked.gltf`
  await exportGLTF(modelEntity, newURL)
  // TODO: mesh baking - run through ModelTransformFunctions::transformModel
  getComponent(modelEntity, ModelComponent).src = newURL
}

const publishBakedScene = async (name: string, sceneId: string) => {
  const locationData: LocationData = {
    name,
    slugifiedName: '',
    sceneId,
    maxUsersPerInstance: 20,
    locationSetting: {
      id: '',
      locationId: '' as LocationID,
      locationType: 'private',
      audioEnabled: true,
      screenSharingEnabled: true,
      faceStreamingEnabled: false,
      videoEnabled: true,
      createdAt: '',
      updatedAt: ''
    },
    isLobby: false,
    isFeatured: false
  }

  const onError = (error) => NotificationService.dispatchNotify(error.message, { variant: 'error' })
  const locationMutation = useMutation(locationPath)

  // TODO: create vs patch
  await locationMutation.create(locationData).catch(onError)
  // await locationMutation.patch(selectedLocation.id, locationData).catch(onError)
}

const PublishJobReactor = (props: { locationName: string }) => {
  const jobState = useHookstate(getMutableState(PublishJobState)[props.locationName])
  const state = useHookstate({})
  const editorState = useHookstate(getMutableState(EditorState))
  const allMeshes = useQuery([MeshComponent])

  useEffect(() => {
    // TODO: Save As current scene to make duplicate

    // TODO: In duplicated scene, perform mesh baking to de-reference all models in the scene (saving scene as GLTF & fuse/compress scenes)

    const allModels = new Set<Entity>()
    const newBaseModel = makeBaseModel()
    for (const mesh of allMeshes) {
      const parentModel = findParentModel(mesh)
      if (parentModel == null) {
        console.warn('PublishSceneJobState: a mesh in the scene has no parent model.')
      } else {
        allModels.add(parentModel)
      }
      reparentMesh(mesh, newBaseModel)
    }
    Promise.all([
      ...Array.from(allModels).map((model) => exportTransformAndReloadModel(model)),
      exportTransformAndReloadModel(newBaseModel)
    ])
      .then(() => {
        publishBakedScene(props.locationName, editorState.sceneAssetID.value!)
      })
      .then(() => {
        // Reload the original scene

        jobState.set(none) // Final step: end this job
      })
  }, [state.value, editorState, allMeshes])

  return null
}
