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

import { AnimationClip, AnimationMixer, PropertyBinding, SkinnedMesh } from 'three'

import { Entity, removeEntity, UndefinedEntity } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
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
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { v4 } from 'uuid'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { GLTFAssetState } from '../../gltf/GLTFState'

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

/** Override Property Binding for the ECS */
PropertyBinding.findNode = function (root: SkinnedMesh, nodeName: string | number) {
  if (
    nodeName === undefined ||
    nodeName === '' ||
    nodeName === '.' ||
    nodeName === -1 ||
    nodeName === root.name ||
    nodeName === root.uuid
  ) {
    return root
  }

  // search into skeleton bones.
  if (root.skeleton) {
    const bone = root.skeleton.getBoneByName(nodeName as string)

    if (bone !== undefined) {
      return bone
    }
  }

  const entity = root.entity
  if (entity) {
    if (!hasComponent(entity, EntityTreeComponent)) return null

    const children = getComponent(entity, EntityTreeComponent).children

    // search into node subtree.
    const searchEntitySubtree = function (children: Entity[]) {
      for (let i = 0; i < children.length; i++) {
        const entity = children[i]
        const childNode =
          getOptionalComponent(entity, BoneComponent) ??
          getOptionalComponent(entity, MeshComponent) ??
          getOptionalComponent(entity, SkinnedMeshComponent) ??
          getOptionalComponent(entity, Object3DComponent)!

        if (childNode && (childNode.name === nodeName || childNode.uuid === nodeName)) {
          return childNode
        }

        const result = searchEntitySubtree(getComponent(entity, EntityTreeComponent).children)

        if (result) return result
      }

      return null
    }

    const subTreeNode = searchEntitySubtree(children)

    if (subTreeNode) {
      return subTreeNode
    }
  }

  // fallback to three hierarchy for non-ecs hierarchy (normalize vrm rigs)
  const searchNodeSubtree = function (children) {
    for (let i = 0; i < children.length; i++) {
      const childNode = children[i]

      if (childNode.name === nodeName || childNode.uuid === nodeName) {
        return childNode
      }

      const result = searchNodeSubtree(childNode.children)

      if (result) return result
    }

    return null
  }

  const subTreeNode = searchNodeSubtree(root.children)

  if (subTreeNode) {
    return subTreeNode
  }

  return null
}
