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

import { AnimationClip, AnimationMixer, Object3D, PropertyBinding } from 'three'

import { Entity, removeEntity, UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  removeComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, State, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { v4 } from 'uuid'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { GLTFAssetState } from '../../gltf/GLTFState'
import { SourceComponent } from '../../scene/components/SourceComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'
import { NormalizedBoneComponent } from './NormalizedBoneComponent'

export const AnimationComponent = defineComponent({
  name: 'AnimationComponent',

  schema: S.Object({
    mixer: S.Type<AnimationMixer>(),
    animations: S.Array(S.Type<AnimationClip>())
  })
})

export const useLoadAnimationFromBatchGLTF = (urls: string[], keepEntities = false) => {
  const animations = urls.map((url) => useLoadAnimationFromGLTF(url, keepEntities))
  const loadedAnimations = useHookstate(null as [AnimationClip[] | null, Entity][] | null)
  useEffect(() => {
    if (loadedAnimations.value || animations.some((animation) => !animation[0].value)) return
    loadedAnimations.set(animations.map((animation) => [animation[0].get(NO_PROXY)!, animation[1]]))
  }, [animations])
  return loadedAnimations as State<[AnimationClip[] | null, Entity][]>
}

export const useLoadAnimationFromGLTF = (url: string, keepEntity = false) => {
  const assetEntity = useMutableState(GLTFAssetState)[url].value
  const animation = useHookstate(null as AnimationClip[] | null)
  const animationComponent = useOptionalComponent(assetEntity, AnimationComponent)
  const progress = useOptionalComponent(assetEntity, GLTFComponent)?.progress

  useEffect(() => {
    if (animation.value) return
    if (!assetEntity) {
      GLTFAssetState.loadScene(url, v4())
      return
    }
  }, [progress])

  useEffect(() => {
    if (!animationComponent?.animations || !animationComponent.animations.length || animation.value) return
    iterateEntityNode(assetEntity, (entity) => {
      removeComponent(entity, MeshComponent)
      removeComponent(entity, SkinnedMeshComponent)
      removeComponent(entity, MaterialStateComponent)
      removeComponent(entity, MaterialInstanceComponent)
    })
    animation.set(getComponent(assetEntity, AnimationComponent).animations)
    if (!keepEntity) removeEntity(assetEntity)
  }, [animationComponent?.animations])
  return [animation, keepEntity ? assetEntity : UndefinedEntity] as [State<AnimationClip[]>, Entity]
}

PropertyBinding.parseTrackName = function (trackName) {
  const lastDotIndex = trackName.lastIndexOf('.')
  const beforeLastDot = trackName.substring(0, lastDotIndex)
  const afterLastDot = trackName.substring(lastDotIndex + 1)

  const results = {
    nodeName: beforeLastDot,
    objectName: undefined! as string,
    objectIndex: undefined! as string,
    propertyName: afterLastDot, // required
    propertyIndex: undefined! as string
  }

  if (results.propertyName === null || results.propertyName.length === 0) {
    throw new Error('PropertyBinding: can not parse propertyName from trackName: ' + trackName)
  }

  return results
}

export const getTrackId = (entity: Entity) =>
  getComponent(entity, UUIDComponent).replace(getComponent(entity, SourceComponent) + '-', '')

PropertyBinding.findNode = (root: Object3D, nodeName: string) => {
  const sceneInstanceID = GLTFComponent.getInstanceID(root.entity)
  const childEntities = SourceComponent.entitiesBySource[sceneInstanceID]

  let entity = UndefinedEntity
  /**if AvatarRigComponent is present, use VRM schema */
  const avatarRigComponent = getOptionalComponent(root.entity, AvatarRigComponent)
  if (avatarRigComponent) {
    entity = avatarRigComponent.bonesToEntities[nodeName]
  }

  /**Find the entity that corresponds to the nodeName.
   * Using getTrackId to allow reuse of the same track for identical hierarchies across different entity roots.
   */
  if (!entity)
    entity = childEntities.find((entity) => getTrackId(entity) === nodeName.substring(nodeName.lastIndexOf('-') + 1))!

  if (!entity) {
    return null
  }

  return (
    getOptionalComponent(entity, NormalizedBoneComponent) ||
    getOptionalComponent(entity, BoneComponent) ||
    getOptionalComponent(entity, MeshComponent) ||
    getOptionalComponent(entity, Object3DComponent)!
  )
}
