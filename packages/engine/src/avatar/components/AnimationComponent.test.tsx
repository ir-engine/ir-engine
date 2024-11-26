import {
  createEngine,
  createEntity,
  destroyEngine,
  generateEntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  SystemDefinitions,
  UUIDComponent
} from '@ir-engine/ecs'
import { applyIncomingActions, startReactor } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { render } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { AnimationMixer } from 'three'
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { AvatarAnimationSystem, setupMixamoAnimation } from '../systems/AvatarAnimationSystem'
import { AnimationComponent } from './AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './AvatarAnimationComponent'
import { AvatarComponent } from './AvatarComponent'

const setupEntity = () => {
  const parent = createEntity()
  setComponent(parent, SceneComponent)
  setComponent(parent, EntityTreeComponent)
  setComponent(parent, UUIDComponent, generateEntityUUID())
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

const default_url = 'packages/projects/default-project/assets'
const rings_gltf = default_url + '/rings.glb'
const animation_pack = default_url + '/animations/emotes.glb'
const vrm = default_url + '/avatars/male_01.vrm'

describe('AnimationComponent', () => {
  describe('Animation Binding', () => {
    overrideFileLoaderLoad()

    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    const compareFlatQuaternions = (a: number[], b: number[]) => {
      for (let i = 0; i < a.length; i++) {
        assert(a[i] === b[i])
      }
    }

    it('should bind animation tracks to entities based on node id sourced from entity UUIDs', async () => {
      const entity = setupEntity()

      setComponent(entity, UUIDComponent, generateEntityUUID())
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      const { rerender, unmount } = render(<></>)
      applyIncomingActions()
      await act(async () => rerender(<></>))
      //extra wait for animation component to prevent race conditions
      await vi.waitFor(
        () => {
          expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
        },
        { timeout: 20000 }
      )
      const startingFlatQuaternions = [] as number[]
      iterateEntityNode(entity, (e) => {
        if (hasComponent(e, MeshComponent))
          startingFlatQuaternions.push(...getComponent(e, TransformComponent).rotation.toArray())
      })
      const animationComponent = getComponent(entity, AnimationComponent)
      animationComponent.mixer.clipAction(animationComponent.animations[0]).play()
      animationComponent.mixer.update(0.1)

      const animatedFlatQuaternions = [] as number[]
      iterateEntityNode(entity, (e) => {
        if (hasComponent(e, MeshComponent))
          animatedFlatQuaternions.push(...getComponent(e, TransformComponent).rotation.toArray())
      })

      //quaternions update as a side effect of successful animation binding, so assert that they've changed
      compareFlatQuaternions(startingFlatQuaternions, animatedFlatQuaternions)
      unmount()
    })

    it('should bind animation tracks to rig entities based on VRM schema', async () => {
      const animationPackEntity = setupEntity()

      setComponent(animationPackEntity, UUIDComponent, generateEntityUUID())
      setComponent(animationPackEntity, GLTFComponent, { src: animation_pack })
      setComponent(animationPackEntity, NameComponent, 'animationPack')

      const vrmEntity = setupEntity()

      setComponent(vrmEntity, UUIDComponent, generateEntityUUID())
      setComponent(vrmEntity, GLTFComponent, { src: vrm })
      setComponent(vrmEntity, AvatarRigComponent)
      setComponent(vrmEntity, AvatarAnimationComponent)
      setComponent(vrmEntity, AvatarComponent)
      startReactor(SystemDefinitions.get(AvatarAnimationSystem)!.reactor!)
      const { rerender, unmount } = render(<></>)
      applyIncomingActions()
      //extra wait for animation component to prevent race conditions
      await vi.waitFor(
        () => {
          expect(
            getOptionalComponent(animationPackEntity, AnimationComponent) &&
              getOptionalComponent(vrmEntity, AvatarRigComponent)?.vrm?.scene
          ).toBeTruthy()
        },
        { timeout: 20000 }
      )

      setupMixamoAnimation(animationPackEntity)

      const animationComponent = setComponent(vrmEntity, AnimationComponent, {
        animations: getComponent(animationPackEntity, AnimationComponent).animations,
        mixer: new AnimationMixer(getComponent(vrmEntity, AvatarRigComponent).vrm.scene)
      })

      const startingFlatQuaternions = [] as number[]
      iterateEntityNode(vrmEntity, (e) => {
        if (hasComponent(e, MeshComponent))
          startingFlatQuaternions.push(...getComponent(e, TransformComponent).rotation.toArray())
      })

      animationComponent.mixer.clipAction(animationComponent.animations[0]).play()
      animationComponent.mixer.update(0.1)

      const animatedFlatQuaternions = [] as number[]
      iterateEntityNode(vrmEntity, (e) => {
        if (hasComponent(e, MeshComponent))
          animatedFlatQuaternions.push(...getComponent(e, TransformComponent).rotation.toArray())
      })

      compareFlatQuaternions(startingFlatQuaternions, animatedFlatQuaternions)
      unmount()
    })
  })
})
