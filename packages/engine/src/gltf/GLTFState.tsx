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
import React, { useEffect } from 'react'
import { FrontSide, Group, LoaderUtils, MathUtils, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three'

import {
  Entity,
  EntityTreeComponent,
  EntityUUID,
  LayerComponent,
  Layers,
  PresentationSystemGroup,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  defineSystem,
  getAncestorWithComponents,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  useQuery
} from '@ir-engine/ecs'
import { EngineState } from '@ir-engine/ecs/src/EngineState'
import {
  NO_PROXY,
  State,
  Topic,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { GLTFParserOptions } from '../assets/loaders/gltf/GLTFParser'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFComponent, GLTFComponentReactor } from './GLTFComponent'
import { GLTFDocumentState, GLTFSnapshotAction } from './GLTFDocumentState'
import './MeshExtensionComponents'

export const GLTFAssetState = defineState({
  name: 'ee.engine.gltf.GLTFAssetState',
  initial: {} as Record<string, Entity>, // sceneID => entity

  loadScene: (sceneURL: string, uuid: string) => {
    const gltfEntity = GLTFSourceState.load(sceneURL, uuid as EntityUUID, getState(ReferenceSpaceState).originEntity)
    getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    setComponent(gltfEntity, SceneComponent)

    return () => {
      GLTFSourceState.unload(gltfEntity)
      getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    }
  }
})

export const GLTFSourceState = defineState({
  name: 'ee.engine.gltf.GLTFSourceState',
  initial: {} as Record<string, Entity>,

  /**
   * @param source The asset URL for the GLTF file
   * @param uuid Identitifies this GLTF uniquely, either as a location instance or loaded as an asset referenced in another GLTF file
   * @param parentEntity The parent entity to attach the GLTF to
   * @returns
   */
  load: (source: string, uuid = MathUtils.generateUUID() as EntityUUID, parentEntity = UndefinedEntity) => {
    // getState(EngineState).isEditing is a hack, we will pass this down as needed
    const entity = createEntity(getState(EngineState).isEditing ? Layers.Authoring : Layers.Simulation)
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, NameComponent, source.split('/').pop()!)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity })
    const sourceID = `${getComponent(entity, UUIDComponent)}-${source}`
    setComponent(entity, SourceComponent, sourceID)
    setComponent(entity, GLTFComponent, { src: source })
    const obj3d = new Group()
    setComponent(entity, ObjectComponent, obj3d)
    return entity
  },

  unload: (entity: Entity) => {
    removeEntity(entity)
  }
})

export const GLTFLoadSystem = defineSystem({
  uuid: 'ee.engine.gltf.GLTFLoadSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const gltfSimulationEntities = useQuery([GLTFComponent])
    const gltfAuthoringEntities = useQuery([GLTFComponent], Layers.Authoring)
    const gltfEntities = [...gltfSimulationEntities, ...gltfAuthoringEntities]
    return (
      <>
        {/* The authoring layer entities will have their entities propagated to the simulation layer */}
        {gltfEntities.map((entity) => {
          if (LayerComponent.hasUpstreamEntity(entity)) return null
          return <GLTFComponentReactor key={'simulation-' + entity} entity={entity} />
        })}
        {/* {gltfAuthoringEntities.map((entity) => (
          <GLTFComponentReactor key={'authoring-' + entity} entity={entity} />
        ))} */}
      </>
    )
  }
})

export type GLTFSnapshotStateType = Record<
  string,
  {
    snapshots: Array<GLTF.IGLTF>
    index: number
  }
>
export const GLTFSnapshotState = defineState({
  name: 'ee.engine.gltf.GLTFSnapshotState',
  initial: {} as GLTFSnapshotStateType,

  receptors: {
    onSnapshot: GLTFSnapshotAction.createSnapshot.receive((action) => {
      // update the snapshot state
      const { data } = action
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (!state.value) {
        state.set({ index: 0, snapshots: [data] })
        return
      }
      state.index.set(state.index.value + 1)
      const snapshots = getState(GLTFSnapshotState)[action.source].snapshots
      // override whatever snapshots have been undone
      state.snapshots.set([...snapshots.splice(0, state.index.value), data])
    }),

    onUndo: GLTFSnapshotAction.undo.receive((action) => {
      // update the snapshot state
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (state.index.value <= 0) return
      state.index.set(Math.max(state.index.value - action.count, 0))
    }),

    onRedo: GLTFSnapshotAction.redo.receive((action) => {
      // update the snapshot state
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (state.index.value >= state.snapshots.value.length - 1) return
      state.index.set(Math.min(state.index.value + action.count, state.snapshots.value.length - 1))
    }),

    onClearHistory: GLTFSnapshotAction.clearHistory.receive((action) => {
      // update the snapshot state
      const state = getState(GLTFSnapshotState)[action.source]
      const data = state.snapshots[0]
      getMutableState(GLTFSnapshotState)[action.source].set({
        index: 0,
        snapshots: [data]
      })
    }),

    onUnload: GLTFSnapshotAction.unload.receive((action) => {
      getMutableState(GLTFSnapshotState)[action.source].set(none)
    })
  },

  useSnapshotIndex(source: string): State<number> | undefined {
    return useMutableState(GLTFSnapshotState)[source]?.index
  },

  isInSnapshot: (source: string | undefined, entity: Entity): boolean => {
    const uuid = getOptionalComponent(entity, UUIDComponent)
    if (!source || !uuid) return false

    const gltf = getState(GLTFSnapshotState)[source]
    if (!gltf) return false

    const snapshot = gltf.snapshots[gltf.index]
    if (!snapshot.nodes) return false

    for (const node of snapshot.nodes) {
      const nodeUUID = node.extensions?.[UUIDComponent.jsonID]
      if (nodeUUID === uuid) return true
    }

    return false
  },

  findTopLevelParent: (entity: Entity): Entity => {
    const source = getOptionalComponent(entity, SourceComponent)
    const uuid = getOptionalComponent(entity, UUIDComponent)
    if (!source || !uuid) return UndefinedEntity

    const gltf = getState(GLTFSnapshotState)[source]
    if (!gltf) return UndefinedEntity

    const snapshot = gltf.snapshots[gltf.index]
    if (!snapshot.nodes) return UndefinedEntity

    let parentUUID: EntityUUID | undefined = uuid
    let currentUUID: EntityUUID = uuid

    const findParent = (uuid: EntityUUID): EntityUUID | undefined => {
      for (let i = 0; i < snapshot.nodes!.length; i++) {
        const node = snapshot.nodes![i]
        if (node.children && node.children.length) {
          for (const child of node.children) {
            const childNode = snapshot.nodes![child]
            const childUUID = childNode.extensions?.[UUIDComponent.jsonID]
            if (childUUID === uuid) {
              return node.extensions?.[UUIDComponent.jsonID] as EntityUUID
            }
          }
        }
      }

      return undefined
    }

    while ((parentUUID = findParent(parentUUID)) && parentUUID) {
      currentUUID = parentUUID
    }

    return UUIDComponent.getEntityByUUID(currentUUID)
  },

  cloneCurrentSnapshot: (source: string) => {
    const state = getState(GLTFSnapshotState)[source]
    return structuredClone({ source, data: state.snapshots[state.index] }) as {
      data: GLTF.IGLTF
      source: string
    }
  },

  injectSnapshot: (srcNode: EntityUUID, srcSnapshotID: string, dstNode: EntityUUID, dstSnapshotID: string) => {
    const snapshot = GLTFSnapshotState.cloneCurrentSnapshot(srcSnapshotID)
    const parentSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(dstSnapshotID)
    //create new node list with the model entity removed
    //remove model entity from scene nodes
    const srcEntity = UUIDComponent.getEntityByUUID(srcNode)
    const srcTransform = getComponent(srcEntity, TransformComponent)
    const childEntities = getComponent(srcEntity, EntityTreeComponent).children
    for (const child of childEntities) {
      const transform = getComponent(child, TransformComponent)
      //apply the model's transform to the children, such that it has the same world transform after the model is removed
      //combine position
      const position = new Vector3().copy(transform.position)
      position.applyQuaternion(srcTransform.rotation)
      position.add(srcTransform.position)
      //combine rotation
      const rotation = new Quaternion().copy(srcTransform.rotation)
      rotation.multiply(transform.rotation)
      //combine scale
      const scale = new Vector3().copy(transform.scale)
      scale.multiply(srcTransform.scale)
      //set new transform on the node in the new snapshot
      const childNode = snapshot.data.nodes?.find(
        (node) => node.extensions?.[UUIDComponent.jsonID] === getComponent(child, UUIDComponent)
      )
      if (!childNode) continue
      childNode.matrix = new Matrix4().compose(position, rotation, scale).toArray()
    }
    const modelIndex = parentSnapshot.data.nodes?.findIndex(
      (node) => node.extensions?.[UUIDComponent.jsonID] === srcNode
    )
    parentSnapshot.data.scenes![0].nodes = parentSnapshot.data.scenes![0].nodes.filter((node) => node !== modelIndex)
    const newNodes = parentSnapshot.data.nodes?.filter((node) => node.extensions?.[UUIDComponent.jsonID] !== srcNode)
    //recalculate child indices
    if (!newNodes) return
    for (const node of newNodes) {
      if (!node.children) continue
      const newChildren: number[] = []
      for (const child of node.children) {
        const childNode = parentSnapshot.data.nodes?.[child]
        const childUUID = childNode?.extensions?.[UUIDComponent.jsonID]
        if (!childUUID) continue
        const childIndex = newNodes.findIndex((node) => node.extensions?.[UUIDComponent.jsonID] === childUUID)
        if (childIndex === -1) continue
        newChildren.push(childIndex)
      }
      node.children = newChildren
    }
    parentSnapshot.data.nodes = newNodes

    const rootIndices = snapshot.data.scenes![0].nodes!
    const roots = rootIndices.map((index) => snapshot.data.nodes?.[index])
    parentSnapshot.data.nodes = [...parentSnapshot.data.nodes!, ...snapshot.data.nodes!]
    const childIndices = roots.map((root) => parentSnapshot.data.nodes!.findIndex((node) => node === root)!)
    const parentNode = parentSnapshot.data.nodes?.find((node) => node.extensions?.[UUIDComponent.jsonID] === dstNode)
    //if the parent is not the root of the gltf document, add the child indices to the parent's children
    if (parentNode) {
      parentNode.children = [...(parentNode.children ?? []), ...childIndices]
    } else {
      //otherwise, add the child indices to the scene's nodes as roots
      parentSnapshot.data.scenes![0].nodes.push(...childIndices)
    }

    //recalculate child indices of newly added nodes
    for (const node of parentSnapshot.data.nodes!) {
      if (!node.children) continue
      //only operate on nodes that are being injected
      if (!snapshot.data.nodes!.includes(node)) continue

      const newChildren: number[] = []
      for (const child of node.children) {
        const childNode = snapshot.data.nodes?.[child]
        const childUUID = childNode?.extensions?.[UUIDComponent.jsonID]
        if (!childUUID) continue
        const newChildIndex = parentSnapshot.data.nodes!.findIndex(
          (node) => node.extensions?.[UUIDComponent.jsonID] === childUUID
        )
        if (newChildIndex === -1) continue
        newChildren.push(newChildIndex)
      }
      node.children = newChildren
    }
    dispatchAction(GLTFSnapshotAction.createSnapshot({ source: dstSnapshotID, data: parentSnapshot.data }))
    dispatchAction(GLTFSnapshotAction.unload({ source: srcSnapshotID }))
  }
})

export const EditorTopic = 'editor' as Topic

export const getNodeUUID = (node: GLTF.INode, documentID: string, nodeIndex: number) =>
  (node.extensions?.[UUIDComponent.jsonID] as EntityUUID) ?? (`${documentID}-${nodeIndex}` as EntityUUID)

const CameraReactor = (props: { nodeIndex: number; documentID: string; entity: Entity }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const camera = documentState.cameras.get(NO_PROXY)![node.camera!] as GLTF.ICamera

  useEffect(() => {
    if (camera.type === 'orthographic' || !camera.perspective)
      return console.warn('Orthographic cameras not supported yet')

    const perspectiveCamera = camera.perspective

    setComponent(props.entity, CameraComponent, {
      fov: MathUtils.radToDeg(perspectiveCamera.yfov),
      aspect: perspectiveCamera.aspectRatio || 1,
      near: perspectiveCamera.znear || 1,
      far: perspectiveCamera.zfar || 2e6
    })
  }, [camera])

  return null
}

export const defaultMaterial = () =>
  new MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x000000,
    metalness: 0,
    roughness: 1,
    transparent: false,
    depthTest: true,
    side: FrontSide
  })

export const getParserOptions = (entity: Entity) => {
  const gltfEntity = getAncestorWithComponents(entity, [GLTFComponent])
  const documentID = GLTFComponent.getInstanceID(gltfEntity)
  const gltfComponent = getComponent(gltfEntity, GLTFComponent)
  const document = gltfComponent.document
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  return {
    entity: gltfEntity,
    document,
    documentID,
    url: gltfComponent.src,
    path: LoaderUtils.extractUrlBase(gltfComponent.src),
    body: gltfComponent.body,
    crossOrigin: gltfLoader.crossOrigin,
    requestHeader: gltfLoader.requestHeader,
    manager: gltfLoader.manager,
    ktx2Loader: gltfLoader.ktx2Loader,
    meshoptDecoder: gltfLoader.meshoptDecoder
  } as GLTFParserOptions
}
