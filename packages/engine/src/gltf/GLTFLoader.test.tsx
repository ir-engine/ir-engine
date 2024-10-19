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
  ComponentType,
  Entity,
  EntityContext,
  EntityUUID,
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getComponent,
  hasComponent,
  setComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import {
  NO_PROXY,
  ReactorRoot,
  applyIncomingActions,
  getMutableState,
  getState,
  startReactor,
  useDidMount,
  useMutableState
} from '@ir-engine/hyperflux'
import { DirectionalLightComponent, PointLightComponent, SpotLightComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { RapierWorldState } from '@ir-engine/spatial/src/physics/classes/Physics'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { EntityTreeComponent, getChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'
import Sinon from 'sinon'
import { BufferGeometry, InstancedMesh, MathUtils, MeshStandardMaterial } from 'three'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFNode, GLTFNodeState } from './GLTFDocumentState'
import { getNodeUUID } from './GLTFState'
import { KHRUnlitExtensionComponent, MaterialDefinitionComponent } from './MaterialDefinitionComponent'
import { EXTMeshGPUInstancingComponent, KHRLightsPunctualComponent, KHRPunctualLight } from './MeshExtensionComponents'
import { afterEach, beforeEach, describe, it } from 'vitest'

const CDN_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0'
const duck_gltf = CDN_URL + '/Duck/glTF/Duck.gltf'
const draco_box = CDN_URL + '/Box/glTF-Draco/Box.gltf'
const unlit_gltf = CDN_URL + '/UnlitTest/glTF/UnlitTest.gltf'
const textured_gltf = CDN_URL + '/BoxTextured/glTF/BoxTextured.gltf'
const multiple_mesh_primitives_gltf = CDN_URL + '/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf'
const morph_gltf = CDN_URL + '/AnimatedMorphCube/glTF/AnimatedMorphCube.gltf'
const skinned_gltf = CDN_URL + '/Fox/glTF/Fox.gltf'
const camera_gltf = CDN_URL + '/Cameras/glTF/Cameras.gltf'
const khr_light_gltf = CDN_URL + '/LightsPunctualLamp/glTF/LightsPunctualLamp.gltf'
const instanced_gltf = CDN_URL + '/SimpleInstancing/glTF/SimpleInstancing.gltf'

const gltfCompletedIO = async (entity: Entity) => {
  return new Promise((resolve) => {
    const gltfComponent = getComponent(entity, GLTFComponent)
    const wait = () => {
      if (!gltfComponent.dependencies) setTimeout(wait, 100)
      else resolve(null)
    }
    wait()
  })
}

// Needed when the component relies on a file read before being created (ie. materials with textures)
const componentsLoaded = async (entity: Entity, components: ComponentType<any>[], expected: number) => {
  return new Promise((resolve) => {
    const wait = () => {
      const entities = getChildrenWithComponents(entity, components)
      if (entities.length !== expected) setTimeout(wait, 100)
      else resolve(null)
    }
    wait()
  })
}

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

describe('GLTF Loader', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can load a mesh', () => new Promise<void>(done => {
    const entity = setupEntity()

    const root = startReactor(() => {
      return React.createElement(
        EntityContext.Provider,
        { value: entity },
        React.createElement(() => {
          const entity = useEntityContext()
          const gltfComponent = useOptionalComponent(entity, GLTFComponent)
          const instanceID = GLTFComponent.useInstanceID(entity)
          const gltfDocumentState = useMutableState(GLTFDocumentState)
          const nodeState = useMutableState(GLTFNodeState)
          const gltf = gltfDocumentState[instanceID].get(NO_PROXY)
          const nodes = nodeState[instanceID].get(NO_PROXY)

          useEffect(() => {
            setComponent(entity, UUIDComponent, generateEntityUUID())
            setComponent(entity, GLTFComponent, { src: duck_gltf })
          }, [])

          useEffect(() => {
            if (!gltfComponent || !gltfComponent.dependencies.value) return
            applyIncomingActions()
          }, [gltfComponent?.dependencies])

          const MeshReactor = (props: { entity: Entity; nodeIndex: number }) => {
            const { entity, nodeIndex } = props
            const meshComponent = useOptionalComponent(entity, MeshComponent)

            useDidMount(() => {
              assert(meshComponent)
              assert(meshComponent.name.value === 'Node-' + nodeIndex)
              assert(meshComponent.entity.value === entity)
              root.stop()
              done()
            }, [meshComponent])

            return null
          }

          const NodeReactor = (props: { source: string; node: GLTFNode; gltf: GLTF.IGLTF }) => {
            const { source, node, gltf } = props
            const nodeIndex = node.nodeIndex
            const documentNode = gltf.nodes![nodeIndex]
            const nodeUUID = getNodeUUID(documentNode, source, nodeIndex)
            const entity = UUIDComponent.useEntityByUUID(nodeUUID)

            return entity && typeof documentNode.mesh === 'number' ? (
              <MeshReactor entity={entity} nodeIndex={nodeIndex} />
            ) : null
          }

          return nodes ? (
            <>
              {Object.entries(nodes).map(([source, node], index) => {
                return <NodeReactor key={index} source={instanceID} node={node} gltf={gltf as GLTF.IGLTF} />
              })}
            </>
          ) : null
        }, {})
      )
    })
  }))

  const assertMaterial = (materialDef: ComponentType<typeof MaterialDefinitionComponent>, material: GLTF.IMaterial) => {
    for (const key in material) {
      assert.deepEqual(material[key], materialDef[key])
    }
  }

  it('can load a material', () => new Promise<void>(done => {
    const entity = setupEntity()

    const root = startReactor(() => {
      return React.createElement(
        EntityContext.Provider,
        { value: entity },
        React.createElement(() => {
          const entity = useEntityContext()
          const gltfComponent = useOptionalComponent(entity, GLTFComponent)
          const uuid = useOptionalComponent(entity, UUIDComponent)?.value

          useEffect(() => {
            setComponent(entity, UUIDComponent, generateEntityUUID())
            setComponent(entity, GLTFComponent, { src: duck_gltf })
          }, [])

          useEffect(() => {
            if (!gltfComponent || !gltfComponent.dependencies.value) return
            applyIncomingActions()
          }, [gltfComponent?.dependencies])

          const ChildReactor = (props: { entity: Entity; gltf: GLTF.IGLTF }) => {
            const { entity, gltf } = props
            const materialDef = useOptionalComponent(entity, MaterialDefinitionComponent)

            useEffect(() => {
              if (!materialDef) return

              const matDef = getComponent(entity, MaterialDefinitionComponent)
              assertMaterial(matDef, gltf.materials![0])
              root.stop()
              done()
            }, [materialDef])

            return null
          }

          const ParentReactor = (props: { parentUUID: EntityUUID }) => {
            const { parentUUID } = props
            const parentEntity = UUIDComponent.useEntityByUUID(parentUUID)
            const children = useOptionalComponent(parentEntity, EntityTreeComponent)?.children.value
            const instanceID = GLTFComponent.useInstanceID(parentEntity)
            const gltfDocumentState = useMutableState(GLTFDocumentState)
            const gltf = gltfDocumentState[instanceID].get(NO_PROXY)

            return children && children.length ? (
              <>
                {children.map((child) => {
                  return <ChildReactor key={child} entity={child} gltf={gltf as GLTF.IGLTF} />
                })}
              </>
            ) : null
          }

          return uuid ? (
            <>
              <ParentReactor parentUUID={uuid} />
            </>
          ) : null
        }, {})
      )
    })
  }))

  it('can load a draco geometry', () => new Promise<void>(done => {
    const entity = setupEntity()

    const dracoLoader = getState(AssetLoaderState).gltfLoader.dracoLoader!

    const spy = Sinon.spy()
    dracoLoader.preload = () => {
      spy()
      return dracoLoader
    }

    const root = startReactor(() => {
      return React.createElement(
        EntityContext.Provider,
        { value: entity },
        React.createElement(() => {
          const entity = useEntityContext()
          const gltfComponent = useOptionalComponent(entity, GLTFComponent)
          const instanceID = GLTFComponent.useInstanceID(entity)
          const gltfDocumentState = useMutableState(GLTFDocumentState)
          const nodeState = useMutableState(GLTFNodeState)
          const gltf = gltfDocumentState[instanceID].get(NO_PROXY)
          const nodes = nodeState[instanceID].get(NO_PROXY)

          useEffect(() => {
            setComponent(entity, UUIDComponent, generateEntityUUID())
            setComponent(entity, GLTFComponent, { src: draco_box })
          }, [])

          useEffect(() => {
            if (!gltfComponent || !gltfComponent.dependencies.value) return
            applyIncomingActions()
          }, [gltfComponent?.dependencies])

          const MeshReactor = (props: { entity: Entity; nodeIndex: number }) => {
            const { entity, nodeIndex } = props
            const meshComponent = useOptionalComponent(entity, MeshComponent)

            useDidMount(() => {
              assert(spy.called)
              assert(meshComponent)
              assert(meshComponent.geometry instanceof BufferGeometry)
              root.stop()
              done()
            }, [meshComponent])

            return null
          }

          const NodeReactor = (props: { source: string; node: GLTFNode; gltf: GLTF.IGLTF }) => {
            const { source, node, gltf } = props
            const nodeIndex = node.nodeIndex
            const documentNode = gltf.nodes![nodeIndex]
            const nodeUUID = getNodeUUID(documentNode, source, nodeIndex)
            const entity = UUIDComponent.useEntityByUUID(nodeUUID)

            return entity && typeof documentNode.mesh === 'number' ? (
              <MeshReactor entity={entity} nodeIndex={nodeIndex} />
            ) : null
          }

          return nodes ? (
            <>
              {Object.entries(nodes).map(([source, node], index) => {
                return <NodeReactor key={index} source={instanceID} node={node} gltf={gltf as GLTF.IGLTF} />
              })}
            </>
          ) : null
        }, {})
      )
    })
  }))

  it('can load an unlit material', () => new Promise<void>(done => {
    const entity = setupEntity()

    let loaded = 0

    const unlitMaterialLoaded = (matDef: ComponentType<typeof MaterialDefinitionComponent>, root: ReactorRoot) => {
      assert(matDef.name === 'Orange' || matDef.name === 'Blue')
      loaded += 1
      if (loaded === 2) {
        root.stop()
        done()
      }
    }

    const root = startReactor(() => {
      return React.createElement(
        EntityContext.Provider,
        { value: entity },
        React.createElement(() => {
          const entity = useEntityContext()
          const gltfComponent = useOptionalComponent(entity, GLTFComponent)
          const uuid = useOptionalComponent(entity, UUIDComponent)?.value

          useEffect(() => {
            setComponent(entity, UUIDComponent, generateEntityUUID())
            setComponent(entity, GLTFComponent, { src: unlit_gltf })
          }, [])

          useEffect(() => {
            if (!gltfComponent || !gltfComponent.dependencies.value) return
            applyIncomingActions()
          }, [gltfComponent?.dependencies])

          const ChildReactor = (props: { entity: Entity; gltf: GLTF.IGLTF }) => {
            const { entity, gltf } = props
            const materialDef = useOptionalComponent(entity, MaterialDefinitionComponent)
            const unlitComponent = useOptionalComponent(entity, KHRUnlitExtensionComponent)

            useDidMount(() => {
              if (!materialDef || !unlitComponent) return

              if (materialDef.type.value === 'MeshBasicMaterial') {
                unlitMaterialLoaded(getComponent(entity, MaterialDefinitionComponent), root)
              }
            }, [materialDef, unlitComponent])

            return null
          }

          const ParentReactor = (props: { parentUUID: EntityUUID }) => {
            const { parentUUID } = props
            const parentEntity = UUIDComponent.useEntityByUUID(parentUUID)
            const children = useOptionalComponent(parentEntity, EntityTreeComponent)?.children.value
            const instanceID = GLTFComponent.useInstanceID(parentEntity)
            const gltfDocumentState = useMutableState(GLTFDocumentState)
            const gltf = gltfDocumentState[instanceID].get(NO_PROXY)

            return children && children.length ? (
              <>
                {children.map((child) => {
                  return <ChildReactor key={child} entity={child} gltf={gltf as GLTF.IGLTF} />
                })}
              </>
            ) : null
          }

          return uuid ? (
            <>
              <ParentReactor parentUUID={uuid} />
            </>
          ) : null
        }, {})
      )
    })
  }))

  it('can load an texture for a material', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: textured_gltf })

    const { rerender, unmount } = render(<></>)
    await gltfCompletedIO(entity)
    applyIncomingActions()
    await act(() => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getMutableState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID].get(NO_PROXY) as GLTF.IGLTF

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

  it('can load a meshes with multiple primitives/materials', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: multiple_mesh_primitives_gltf })

    const { rerender, unmount } = render(<></>)
    await gltfCompletedIO(entity)
    applyIncomingActions()
    await act(() => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getMutableState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID].get(NO_PROXY) as GLTF.IGLTF
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

    await componentsLoaded(entity, [MeshComponent], meshes.length)

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
    await gltfCompletedIO(entity)
    applyIncomingActions()
    await act(() => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getMutableState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID].get(NO_PROXY) as GLTF.IGLTF

    await componentsLoaded(entity, [MeshComponent], 1)

    const meshEntity = getChildrenWithComponents(entity, [MeshComponent])[0]
    const mesh = getComponent(meshEntity, MeshComponent)
    assert(mesh.geometry.morphAttributes)
    assert(mesh.geometry.morphTargetsRelative)

    unmount()
  })

  it('can load skinned meshes with bones and animations', async () => {
    const entity = setupEntity()

    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, GLTFComponent, { src: skinned_gltf })

    const { rerender, unmount } = render(<></>)
    await gltfCompletedIO(entity)
    applyIncomingActions()
    await act(() => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getMutableState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID].get(NO_PROXY) as GLTF.IGLTF

    const joints = gltf.skins!.reduce((accum, skin) => {
      if (skin.joints) accum.push(...skin.joints)
      return accum
    }, [] as number[])

    await componentsLoaded(entity, [SkinnedMeshComponent], 1)
    await act(() => rerender(<></>))

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
    await gltfCompletedIO(entity)
    applyIncomingActions()
    await act(() => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getMutableState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID].get(NO_PROXY) as GLTF.IGLTF

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
    await gltfCompletedIO(entity)
    applyIncomingActions()
    await act(() => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getMutableState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID].get(NO_PROXY) as GLTF.IGLTF

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
          {
            assert(hasComponent(khrLightEntity, DirectionalLightComponent))
            const directionalLight = getComponent(khrLightEntity, DirectionalLightComponent)
          }
          break
        case 'point':
          {
            assert(hasComponent(khrLightEntity, PointLightComponent))
            const pointLightComponent = getComponent(khrLightEntity, PointLightComponent)
          }
          break
        case 'spot':
          {
            assert(hasComponent(khrLightEntity, SpotLightComponent))
            const spotLightComponent = getComponent(khrLightEntity, SpotLightComponent)
          }
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
    await gltfCompletedIO(entity)
    applyIncomingActions()
    await act(() => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const gltfDocumentState = getMutableState(GLTFDocumentState)
    const gltf = gltfDocumentState[instanceID].get(NO_PROXY) as GLTF.IGLTF

    await componentsLoaded(entity, [MeshComponent], 1)
    await act(() => rerender(<></>))

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
    await gltfCompletedIO(entity)
    await gltfCompletedIO(entity2)
    applyIncomingActions()
    await act(() => rerender(<></>))

    const instanceID = GLTFComponent.getInstanceID(entity)
    const instanceID2 = GLTFComponent.getInstanceID(entity2)

    assert(instanceID !== instanceID2)

    const gltfDocumentState = getMutableState(GLTFDocumentState)

    const gltf = gltfDocumentState[instanceID].get(NO_PROXY) as GLTF.IGLTF
    const gltf2 = gltfDocumentState[instanceID2].get(NO_PROXY) as GLTF.IGLTF

    assert.deepEqual(gltf, gltf2)

    await componentsLoaded(entity, [MeshComponent], 1)
    await componentsLoaded(entity2, [MeshComponent], 1)
    await act(() => rerender(<></>))

    const meshEntities = getChildrenWithComponents(entity, [MeshComponent])
    const meshEntities2 = getChildrenWithComponents(entity2, [MeshComponent])

    assert(meshEntities.length === meshEntities2.length)

    unmount()
  })
})
