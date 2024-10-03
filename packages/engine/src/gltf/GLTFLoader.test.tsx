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
  createEntity,
  Entity,
  EntityContext,
  EntityUUID,
  generateEntityUUID,
  getComponent,
  setComponent,
  useEntityContext,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import {
  applyIncomingActions,
  getState,
  NO_PROXY,
  ReactorRoot,
  startReactor,
  useDidMount,
  useMutableState
} from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { EntityTreeComponent, useChildWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import assert from 'assert'
import React, { useEffect } from 'react'
import Sinon from 'sinon'
import { BufferGeometry } from 'three'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFNode, GLTFNodeState } from './GLTFDocumentState'
import { getNodeUUID } from './GLTFState'
import { KHRUnlitExtensionComponent, MaterialDefinitionComponent } from './MaterialDefinitionComponent'

const CDN_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0'
const duck_gltf = CDN_URL + '/Duck/glTF/Duck.gltf'
const draco_box = CDN_URL + '/Box/glTF-Draco/Box.gltf'
const unlit_gltf = CDN_URL + '/UnlitTest/glTF/UnlitTest.gltf'
const textured_gltf = CDN_URL + '/BoxTextured/glTF/BoxTextured.gltf'

describe('GLTF Loader', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can load a mesh', (done) => {
    const entity = createEntity()

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
  })

  const assertMaterial = (materialDef: ComponentType<typeof MaterialDefinitionComponent>, material: GLTF.IMaterial) => {
    for (const key in material) {
      assert.deepEqual(material[key], materialDef[key])
    }
  }

  it('can load a material', (done) => {
    const entity = createEntity()

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
  })

  it('can load a draco geometry', (done) => {
    const entity = createEntity()

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
  })

  it('can load an unlit material', (done) => {
    const entity = createEntity()

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
  })

  /** @todo materials aren't reactive since they're updated through setValues */
  it('can load an texture for a material', (done) => {
    const entity = createEntity()

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
            setComponent(entity, GLTFComponent, { src: textured_gltf })
          }, [])

          useEffect(() => {
            if (!gltfComponent || !gltfComponent.dependencies.value) return
            applyIncomingActions()
          }, [gltfComponent?.dependencies])

          const MatStateReactor = (props: { entity: Entity; gltf: GLTF.IGLTF }) => {
            const { entity, gltf } = props
            const material = useOptionalComponent(entity, MaterialStateComponent)?.material

            useEffect(() => {
              if (!material || !material.value) return

              const mat = material.value
              assert(mat)
              root.stop()
              done()
            }, [material])

            return null
          }

          const ParentReactor = (props: { parentUUID: EntityUUID }) => {
            const { parentUUID } = props
            const parentEntity = UUIDComponent.useEntityByUUID(parentUUID)
            const instanceID = GLTFComponent.useInstanceID(parentEntity)
            const gltfDocumentState = useMutableState(GLTFDocumentState)
            const gltf = gltfDocumentState[instanceID].get(NO_PROXY)
            const matEntity = useChildWithComponents(parentEntity, [MaterialStateComponent])

            return matEntity ? <MatStateReactor entity={matEntity} gltf={gltf as GLTF.IGLTF} /> : null
          }

          return uuid ? (
            <>
              <ParentReactor parentUUID={uuid} />
            </>
          ) : null
        }, {})
      )
    })
  })
})
