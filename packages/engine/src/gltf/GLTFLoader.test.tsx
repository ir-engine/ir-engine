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

import { act, render } from '@testing-library/react'
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'

import { GLTF } from '@gltf-transform/core/dist/types/gltf'
import {
  createEntity,
  EntityTreeComponent,
  generateEntityUUID,
  getChildrenWithComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { applyIncomingActions, getState } from '@ir-engine/hyperflux'
import { DirectionalLightComponent, PointLightComponent, SpotLightComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import React from 'react'
import { InstancedMesh, MathUtils, MeshStandardMaterial } from 'three'
import { startEngineReactor } from '../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../tests/util/loadGLTFAssetNode'
import { loadDRACODecoderNode, NodeDRACOLoader } from '../assets/loaders/gltf/NodeDracoLoader'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { GLTFComponent } from './GLTFComponent'
import { KHRUnlitExtensionComponent } from './MaterialExtensionComponents'
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
  const uuid = UUIDComponent.generateUUID()
  setComponent(parent, UUIDComponent, uuid)

  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

describe('GLTF Loader', async () => {
  overrideFileLoaderLoad()

  beforeEach(async () => {
    createEngine()
    startEngineReactor()

    await act(() => render(null))
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can load a mesh', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: duck_gltf })

    await act(() => render(null))

    const document = getComponent(entity, GLTFComponent).document

    const usedMeshes = document!.nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') accum.add(node.mesh)
      return accum
    }, new Set<number>())

    await vi.waitFor(
      async () => {
        expect(getChildrenWithComponents(entity, [MeshComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const meshes = getChildrenWithComponents(entity, [MeshComponent])

    assert(meshes.length === usedMeshes.size)
  })

  it('can load a material', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: duck_gltf })

    await act(() => render(null))

    const document = getComponent(entity, GLTFComponent).document

    const usedMaterials = document!.nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') {
        const mesh = document!.meshes![node.mesh]
        for (const primitive of mesh.primitives) {
          if (typeof primitive.material === 'number') accum.add(primitive.material)
        }
      }
      return accum
    }, new Set<number>())

    await vi.waitFor(
      async () => {
        expect(getChildrenWithComponents(entity, [MaterialStateComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const materials = getChildrenWithComponents(entity, [MaterialStateComponent])
    assert(materials.length === usedMaterials.size)
  })

  it('can load a draco geometry', async () => {
    const entity = setupEntity()

    const loader = getState(AssetLoaderState).gltfLoader
    loadDRACODecoderNode()
    const dracoLoader = new NodeDRACOLoader()
    /* @ts-ignore */
    dracoLoader.preload = () => {
      return dracoLoader
    }
    loader.setDRACOLoader(dracoLoader)

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: draco_gltf })

    await act(() => render(null))

    const document = getComponent(entity, GLTFComponent).document

    const usedMeshes = document!.nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') accum.add(node.mesh)
      return accum
    }, new Set<number>())

    await vi.waitFor(
      async () => {
        expect(getChildrenWithComponents(entity, [MeshComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const meshes = getChildrenWithComponents(entity, [MeshComponent])
    assert(meshes.length === usedMeshes.size)
  })

  it('can load an unlit material', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: unlit_gltf })

    await act(() => render(null))

    const document = getComponent(entity, GLTFComponent).document

    const usedUnlitMaterials = document!.nodes!.reduce((accum, node) => {
      if (typeof node.mesh === 'number') {
        const mesh = document!.meshes![node.mesh]
        for (const primitive of mesh.primitives) {
          if (typeof primitive.material === 'number') {
            const material = document!.materials![primitive.material]
            if (material.extensions && KHRUnlitExtensionComponent.jsonID in material.extensions) {
              accum.add(primitive.material)
            }
          }
        }
      }
      return accum
    }, new Set<number>())

    await vi.waitFor(
      async () => {
        expect(getChildrenWithComponents(entity, [MaterialStateComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const materials = getChildrenWithComponents(entity, [KHRUnlitExtensionComponent])
    assert(materials.length === usedUnlitMaterials.size)
  })

  it('can load a texture for a material', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: textured_gltf })

    await act(() => render(null))

    const document = getComponent(entity, GLTFComponent).document

    const usedTextures = document!.meshes!.reduce((accum, mesh) => {
      if (mesh.primitives.length) {
        for (const prim of mesh.primitives) {
          if (typeof prim.material === 'number')
            accum.add(
              document!.images![document!.materials![prim.material].pbrMetallicRoughness!.baseColorTexture!.index].uri!
            )
        }
      }
      return accum
    }, new Set<string>())

    await vi.waitFor(
      async () => {
        expect(getChildrenWithComponents(entity, [MaterialStateComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const matStateEntities = getChildrenWithComponents(entity, [MaterialStateComponent])
    for (const matStateEntity of matStateEntities) {
      const material = getComponent(matStateEntity, MaterialStateComponent).material as MeshStandardMaterial
      assert(usedTextures.has(material.map!.name))
    }
  })

  it('can load meshes with multiple primitives/materials', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: multiple_mesh_primitives_gltf })

    await act(() => render(null))

    const document = getComponent(entity, GLTFComponent).document
    const nodes = document!.nodes

    const primitives = document!.meshes!.reduce((accum, mesh) => {
      if (mesh.primitives.length) accum.push(...mesh.primitives)
      return accum
    }, [] as GLTF.IMeshPrimitive[])

    const usedMaterials = document!.meshes!.reduce((accum, mesh) => {
      if (mesh.primitives.length) {
        for (const prim of mesh.primitives) {
          if (typeof prim.material === 'number') accum.add(document!.materials![prim.material])
        }
      }
      return accum
    }, new Set<GLTF.IMaterial>())

    await vi.waitFor(
      async () => {
        expect(getChildrenWithComponents(entity, [MeshComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const materials = [...usedMaterials]

    assert(primitives.length > document!.meshes!.length)
    assert(materials.length > document!.meshes!.length)

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
  })

  it('can load morph targets', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: morph_gltf })

    await act(() => render(null))

    await vi.waitFor(
      async () => {
        expect(getChildrenWithComponents(entity, [MeshComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const meshEntity = getChildrenWithComponents(entity, [MeshComponent])[0]
    const mesh = getComponent(meshEntity, MeshComponent)
    assert(mesh.geometry.morphAttributes)
    assert(mesh.geometry.morphTargetsRelative)
  })

  it('can load a mesh with a single animation clip', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: rings_gltf })

    await act(() => render(null))

    await vi.waitFor(
      () => {
        expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
      },
      { timeout: 5000 }
    )
    const document = getComponent(entity, GLTFComponent).document

    const animationComponent = getComponent(entity, AnimationComponent)

    assert(animationComponent.animations.length === document!.animations!.length)
  })

  it('can load a skeleton with many animation clips', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: animation_pack })

    await act(() => render(null))

    const document = getComponent(entity, GLTFComponent).document

    await vi.waitFor(
      () => {
        expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const animationComponent = getComponent(entity, AnimationComponent)
    /**@todo why does this occasionally fail? */
    //assert(animationComponent?.animations.length === document!.animations!.length)
  })

  it('can load skinned meshes with bones and animations', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: skinned_gltf })
    await act(() => render(null))

    await vi.waitFor(
      () => {
        expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const document = getComponent(entity, GLTFComponent).document

    const joints = document!.skins!.reduce((accum, skin) => {
      if (skin.joints) accum.push(...skin.joints)
      return accum
    }, [] as number[])

    const skinnedMeshEntities = getChildrenWithComponents(entity, [SkinnedMeshComponent])
    const boneEntities = getChildrenWithComponents(entity, [BoneComponent])
    const animationComponent = getComponent(entity, AnimationComponent)

    assert(skinnedMeshEntities.length === document!.skins!.length)
    assert(boneEntities.length === joints.length)
    assert(animationComponent.animations.length === document!.animations!.length)

    for (const anim of animationComponent.animations) {
      const gltfAnim = document!.animations!.find((a) => a.name === anim.name)
      assert(gltfAnim?.channels.length === anim.tracks.length)
    }
  })

  it('can load cameras', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: camera_gltf })

    await act(() => render(null))

    const document = getComponent(entity, GLTFComponent).document

    // Update when orthographic cameras are supported
    const cameras = document!.cameras!.filter((cam) => cam.type === 'perspective')

    await vi.waitFor(
      () => {
        expect(getChildrenWithComponents(entity, [CameraComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )
    const cameraEntities = getChildrenWithComponents(entity, [CameraComponent])

    assert(cameraEntities.length === cameras.length)

    const cameraComponent = getComponent(cameraEntities[0], CameraComponent)
    const gltfCamera = cameras[0].perspective!

    assert(cameraComponent.aspect === gltfCamera.aspectRatio)
    assert(cameraComponent.far === gltfCamera.zfar)
    assert(cameraComponent.fov === MathUtils.radToDeg(gltfCamera.yfov))
    assert(cameraComponent.near === gltfCamera.znear)
  })

  /*
  // Fixing up the commented portions of GLTFLoader.test
  // The preceding stuff is working.
  // Should be able to look at the existing changes as a guide and apply them downwards.
  // Might find discrepencies or issues with the loader (as I did with the animation file tests) which will also be helpful
  // - [?] can load KHR lights
  // - [x] can load instanced primitives with EXT_mesh_gpu_instancing
  // - [x] can load multiple of the same GLTF file
  */

  /* @todo Where is KHRLightsPunctualComponent.reactor expected to be run from ??
   * Manually for the test, by some other reactor, or something else ?? */
  it('can load KHR lights', async () => {
    const testEntity = setupEntity()
    setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
    setComponent(testEntity, GLTFComponent, { src: khr_light_gltf })

    await act(() => render(null))
    // @todo @important This line makes the test pass, but only intermitently

    const document = getComponent(testEntity, GLTFComponent).document

    const lights = (document!.extensions![KHRLightsPunctualComponent.jsonID] as any).lights as KHRPunctualLight[]
    expect(lights).toBeTruthy()

    await vi.waitFor(
      () => {
        expect(getChildrenWithComponents(testEntity, [KHRLightsPunctualComponent]).length).toBeTruthy()
      },
      { timeout: 5000 }
    )

    const khrLightEntities = getChildrenWithComponents(testEntity, [KHRLightsPunctualComponent])
    expect(lights.length).toBe(khrLightEntities.length)

    for (const khrLightEntity of khrLightEntities) {
      const khrLightComponent = getComponent(khrLightEntity, KHRLightsPunctualComponent)
      const light = lights[khrLightComponent.light!]
      expect(light).toBeTruthy()

      switch (light.type) {
        case 'directional':
          expect(hasComponent(khrLightEntity, PointLightComponent)).toBeFalsy()
          expect(hasComponent(khrLightEntity, SpotLightComponent)).toBeFalsy()
          expect(hasComponent(khrLightEntity, DirectionalLightComponent)).toBeTruthy()
          break
        case 'point':
          expect(hasComponent(khrLightEntity, DirectionalLightComponent)).toBeFalsy()
          expect(hasComponent(khrLightEntity, SpotLightComponent)).toBeFalsy()
          expect(hasComponent(khrLightEntity, PointLightComponent)).toBeTruthy()
          break
        case 'spot':
          expect(hasComponent(khrLightEntity, DirectionalLightComponent)).toBeFalsy()
          expect(hasComponent(khrLightEntity, PointLightComponent)).toBeFalsy()
          expect(hasComponent(khrLightEntity, SpotLightComponent)).toBeTruthy()
          break
        default:
          break
      }
    }
  })

  it('can load instanced primitives with EXT_mesh_gpu_instancing', async () => {
    const testEntity = setupEntity()

    setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
    setComponent(testEntity, GLTFComponent, { src: instanced_gltf })

    await act(() => render(null))

    await vi.waitFor(
      () => {
        expect(getChildrenWithComponents(testEntity, [EXTMeshGPUInstancingComponent]).length).toBeTruthy()
      },
      { timeout: 5_000 }
    )

    expect(getComponent(testEntity, GLTFComponent).document).not.toBeNull()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    const gltf = getComponent(testEntity, GLTFComponent).document!

    const instancingUsed = gltf.extensionsUsed!.includes(EXTMeshGPUInstancingComponent.jsonID)
    expect(instancingUsed).toBeTruthy()

    const extNodes = gltf.nodes!.reduce((accum, node) => {
      if (node.extensions?.[EXTMeshGPUInstancingComponent.jsonID]) accum.push(node)
      return accum
    }, [] as GLTF.INode[])

    const extMeshGPUEntities = getChildrenWithComponents(testEntity, [EXTMeshGPUInstancingComponent])
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
      expect(node).toBeTruthy()
      const mesh = getComponent(extMeshEntity, MeshComponent)
      expect(mesh instanceof InstancedMesh).toBeTruthy()
    }
  })

  it('can load multiple of the same GLTF file', async () => {
    const entity = setupEntity()
    const entity2 = setupEntity()

    setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
    setComponent(entity, GLTFComponent, { src: duck_gltf })

    setComponent(entity2, UUIDComponent, UUIDComponent.generateUUID())
    setComponent(entity2, GLTFComponent, { src: duck_gltf })

    const { rerender, unmount } = render(<></>)
    applyIncomingActions()
    await act(async () => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const instanceID2 = GLTFComponent.getInstanceID(entity2)

    expect(instanceID).not.toBe(instanceID2)

    const meshEntities = getChildrenWithComponents(entity, [MeshComponent])
    const meshEntities2 = getChildrenWithComponents(entity2, [MeshComponent])

    expect(meshEntities.length).toBe(meshEntities2.length)

    unmount()
  })
})
