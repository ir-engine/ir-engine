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

import { GLTF } from '@gltf-transform/core'
import {
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { applyIncomingActions, getMutableState, getState } from '@ir-engine/hyperflux'
import { DirectionalLightComponent, PointLightComponent, SpotLightComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { RapierWorldState } from '@ir-engine/spatial/src/physics/classes/Physics'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent.ts'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent.ts'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { EntityTreeComponent, getChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import Sinon from 'sinon'
import { InstancedMesh, MathUtils, MeshStandardMaterial } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { overrideFileLoaderLoad } from '../../tests/util/loadGLTFAssetNode'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent.ts'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState } from './GLTFDocumentState'
import { KHRUnlitExtensionComponent, MaterialDefinitionComponent } from './MaterialDefinitionComponent'
import { EXTMeshGPUInstancingComponent, KHRLightsPunctualComponent, KHRPunctualLight } from './MeshExtensionComponents'

const base_url = 'packages/engine/tests/assets'
const duck_gltf = base_url + '/duck/Duck.gltf'
const draco_gltf = base_url + '/draco-duck/Duck.gltf'
const unlit_gltf = base_url + '/unlit/UnlitTest.gltf'
const textured_gltf = base_url + '/textured-box/BoxTextured.gltf'
const multiple_mesh_primitives_gltf = base_url + '/multiple-mesh-primitives/CesiumMilkTruck.gltf'
const morph_gltf = base_url + '/morph-targets/AnimatedMorphCube.gltf'
const skinned_gltf = base_url + '/skinned-mesh/Fox.gltf'
const camera_gltf = base_url + '/camera/Cameras.gltf'
const khr_light_gltf = base_url + '/khr-light/LightsPunctualLamp.gltf'
const instanced_gltf = base_url + '/instanced/SimpleInstancing.gltf'
const default_url = 'packages/projects/default-project/assets'
const animation_pack = default_url + '/animations/emotes.glb'
const rings_gltf = default_url + '/rings.glb'

const setupEntity = () => {
  const parent = createEntity()
  setComponent(parent, SceneComponent)
  setComponent(parent, EntityTreeComponent)
  const uuid = setComponent(parent, UUIDComponent, generateEntityUUID())

  getMutableState(RapierWorldState).merge({
    [uuid]: true as any
  })

  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

describe('GLTF Loader', async () => {
  overrideFileLoaderLoad()

  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can load a mesh', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: duck_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const usedMeshes = gltf.nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') accum.add(node.mesh)
      return accum
    }, new Set<number>())
    await act(async () => rerender(<></>))

    const meshes = getChildrenWithComponents(entity, [MeshComponent])

    await vi.waitFor(
      async () => {
        expect(getChildrenWithComponents(entity, [MeshComponent]).length).toBeTruthy()
      },
      { timeout: 20000 }
    )

    assert(meshes.length === usedMeshes.size)
    unmount()
  })

  it('can load a material', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: duck_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const usedMaterials = gltf.nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') {
        const mesh = gltf.meshes![node.mesh]
        for (const primitive of mesh.primitives) {
          if (typeof primitive.material === 'number') accum.add(primitive.material)
        }
      }
      return accum
    }, new Set<number>())

    const materials = getChildrenWithComponents(entity, [MaterialDefinitionComponent])
    assert(materials.length === usedMaterials.size)
    unmount()
  })

  it('can load a draco geometry', async () => {
    const entity = setupEntity()

    const dracoLoader = getState(AssetLoaderState).gltfLoader.dracoLoader!

    const spy = Sinon.spy(dracoLoader, 'preload')
    // dracoLoader.preload = () => {
    //   spy()
    //   return dracoLoader
    // }

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: draco_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const usedMeshes = gltf.nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') accum.add(node.mesh)
      return accum
    }, new Set<number>())

    const meshes = getChildrenWithComponents(entity, [MeshComponent])
    assert(meshes.length === usedMeshes.size)
    assert(spy.called)
    unmount()
  })

  it('can load an unlit material', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: unlit_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const usedUnlitMaterials = gltf.nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') {
        const mesh = gltf.meshes![node.mesh]
        for (const primitive of mesh.primitives) {
          if (typeof primitive.material === 'number') {
            const material = gltf.materials![primitive.material]
            if (material.extensions && KHRUnlitExtensionComponent.jsonID in material.extensions) {
              accum.add(primitive.material)
            }
          }
        }
      }
      return accum
    }, new Set<number>())

    const materials = getChildrenWithComponents(entity, [KHRUnlitExtensionComponent])
    assert(materials.length === usedUnlitMaterials.size)
    unmount()
  })

  it('can load a texture for a material', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: textured_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const usedTextures = gltf.meshes!.reduce((accum, mesh) => {
      if (mesh.primitives.length) {
        for (const prim of mesh.primitives) {
          if (typeof prim.material === 'number')
            accum.add(gltf.images![gltf.materials![prim.material].pbrMetallicRoughness!.baseColorTexture!.index].uri!)
        }
      }
      return accum
    }, new Set<string>())

    const matStateEntities = getChildrenWithComponents(entity, [MaterialStateComponent])
    for (const matStateEntity of matStateEntities) {
      const material = getComponent(matStateEntity, MaterialStateComponent).material as MeshStandardMaterial
      assert(usedTextures.has(material.map!.name))
    }

    unmount()
  })

  it('can load meshes with multiple primitives/materials', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: multiple_mesh_primitives_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]
    const nodes = gltf.nodes

    const primitives = gltf.meshes!.reduce((accum, mesh) => {
      if (mesh.primitives.length) accum.push(...mesh.primitives)
      return accum
    }, [] as GLTF.IMeshPrimitive[])

    const usedMaterials = gltf.meshes!.reduce((accum, mesh) => {
      if (mesh.primitives.length) {
        for (const prim of mesh.primitives) {
          if (typeof prim.material === 'number') accum.add(gltf.materials![prim.material])
        }
      }
      return accum
    }, new Set<GLTF.IMaterial>())

    const materials = [...usedMaterials]

    assert(primitives.length > gltf.meshes!.length)
    assert(materials.length > gltf.meshes!.length)

    const meshes = nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') accum.push(node.mesh)
      return accum
    }, [] as number[])

    const meshEntities = getChildrenWithComponents(entity, [MeshComponent])
    assert(meshEntities.length === meshes.length)

    const matEntities = getChildrenWithComponents(entity, [MaterialInstanceComponent])
    const uniqueMatUUIDs = matEntities.reduce((uuids, matEntity) => {
      const matInstance = getComponent(matEntity, MaterialInstanceComponent)
      for (const uuid of matInstance.uuid) uuids.add(uuid)
      return uuids
    }, new Set<string>())
    const matUUIDs = [...uniqueMatUUIDs].filter(Boolean)

    assert(materials.length === matUUIDs.length)
    assert(matUUIDs.length > meshEntities.length)

    unmount()
  })

  it('can load morph targets', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: morph_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const meshEntity = getChildrenWithComponents(entity, [MeshComponent])[0]
    const mesh = getComponent(meshEntity, MeshComponent)
    assert(mesh.geometry.morphAttributes)
    assert(mesh.geometry.morphTargetsRelative)

    unmount()
  })

  it('can load a mesh with a single animation clip', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: rings_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))
    await vi.waitFor(
      () => {
        expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
      },
      { timeout: 20000 }
    )
    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const animationComponent = getComponent(entity, AnimationComponent)
    assert(animationComponent.animations.length === gltf.animations!.length)

    unmount()
  })

  it('can load a skeleton with many animation clips', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: animation_pack })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))
    await vi.waitFor(
      () => {
        expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
      },
      { timeout: 20000 }
    )
    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const animationComponent = getComponent(entity, AnimationComponent)
    assert(animationComponent?.animations.length === gltf.animations!.length)

    unmount()
  })

  it('can load skinned meshes with bones and animations', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: skinned_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))
    await vi.waitFor(
      () => {
        expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
      },
      { timeout: 20000 }
    )
    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const joints = gltf.skins!.reduce((accum, skin) => {
      if (skin.joints) accum.push(...skin.joints)
      return accum
    }, [] as number[])

    const skinnedMeshEntities = getChildrenWithComponents(entity, [SkinnedMeshComponent])
    const boneEntities = getChildrenWithComponents(entity, [BoneComponent])
    const animationComponent = getComponent(entity, AnimationComponent)

    assert(skinnedMeshEntities.length === gltf.skins!.length)
    assert(boneEntities.length === joints.length)
    assert(animationComponent.animations.length === gltf.animations!.length)

    for (const anim of animationComponent.animations) {
      const gltfAnim = gltf.animations!.find((a) => a.name === anim.name)
      assert(gltfAnim?.channels.length === anim.tracks.length)
    }

    unmount()
  })

  it('can load cameras', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: camera_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    // Update when orthographic cameras are supported
    const cameras = gltf.cameras!.filter((cam) => cam.type === 'perspective')

    const cameraEntities = getChildrenWithComponents(entity, [CameraComponent])

    assert(cameraEntities.length === cameras.length)

    const cameraComponent = getComponent(cameraEntities[0], CameraComponent)
    const gltfCamera = cameras[0].perspective!

    assert(cameraComponent.aspect === gltfCamera.aspectRatio)
    assert(cameraComponent.far === gltfCamera.zfar)
    assert(cameraComponent.fov === MathUtils.radToDeg(gltfCamera.yfov))
    assert(cameraComponent.near === gltfCamera.znear)

    unmount()
  })

  it('can load KHR lights', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: khr_light_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const lights = (gltf.extensions![KHRLightsPunctualComponent.jsonID] as any).lights as KHRPunctualLight[]
    assert(lights)

    const khrLightEntities = getChildrenWithComponents(entity, [KHRLightsPunctualComponent])
    assert(lights.length === khrLightEntities.length)

    for (const khrLightEntity of khrLightEntities) {
      const khrLightComponent = getComponent(khrLightEntity, KHRLightsPunctualComponent)
      const light = lights[khrLightComponent.light!]
      assert(light)
      switch (light.type) {
        case 'directional':
          assert(hasComponent(khrLightEntity, DirectionalLightComponent))
          break
        case 'point':
          assert(hasComponent(khrLightEntity, PointLightComponent))
          break
        case 'spot':
          assert(hasComponent(khrLightEntity, SpotLightComponent))
          break
        default:
          break
      }
    }

    unmount()
  })

  it('can load instanced primitives with EXT_mesh_gpu_instancing', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: instanced_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))
    await vi.waitFor(
      () => {
        expect(getChildrenWithComponents(entity, [EXTMeshGPUInstancingComponent]).length).toBeTruthy()
      },
      { timeout: 20000 }
    )

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID]

    const instancingUsed = gltf.extensionsUsed!.includes(EXTMeshGPUInstancingComponent.jsonID)
    assert(instancingUsed)

    const extNodes = gltf.nodes!.reduce((accum, node) => {
      if (node.extensions?.[EXTMeshGPUInstancingComponent.jsonID]) accum.push(node)
      return accum
    }, [] as GLTF.INode[])

    const extMeshGPUEntities = getChildrenWithComponents(entity, [EXTMeshGPUInstancingComponent])
    assert(extMeshGPUEntities.length === extNodes.length)

    const findNode = (attr: Record<string, number>) => {
      const nodeIndex = extNodes.findIndex((node) => {
        const ext = (node.extensions![EXTMeshGPUInstancingComponent.jsonID] as any).attributes as Record<string, number>
        for (const attrName in ext) {
          if (attr[attrName] !== ext[attrName]) return false
        }
        return true
      })

      if (nodeIndex === -1) return undefined
      return extNodes.splice(nodeIndex, 1)[0]
    }

    for (const extMeshEntity of extMeshGPUEntities) {
      const extMesh = getComponent(extMeshEntity, EXTMeshGPUInstancingComponent)
      const node = findNode(extMesh.attributes)
      assert(node)
      const mesh = getComponent(extMeshEntity, MeshComponent)
      assert(mesh instanceof InstancedMesh)
    }

    unmount()
  })

  it('can load multiple of the same GLTF file', async () => {
    const entity = setupEntity()
    const entity2 = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: duck_gltf })

    setComponent(entity2, UUIDComponent, generateEntityUUID())
    setComponent(entity2, GLTFComponent, { src: duck_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const instanceID2 = GLTFComponent.getInstanceID(entity2)

    assert(instanceID !== instanceID2)

    const meshEntities = getChildrenWithComponents(entity, [MeshComponent])
    const meshEntities2 = getChildrenWithComponents(entity2, [MeshComponent])

    assert(meshEntities.length === meshEntities2.length)

    unmount()
  })
})
