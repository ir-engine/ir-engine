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
import React, { useEffect, useLayoutEffect } from 'react'
import {
  AnimationClip,
  AnimationMixer,
  Bone,
  BufferGeometry,
  FrontSide,
  Group,
  LoaderUtils,
  MathUtils,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Skeleton,
  SkinnedMesh,
  Vector3
} from 'three'

import {
  ComponentJSONIDMap,
  createEntity,
  Entity,
  entityExists,
  EntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useOptionalComponent,
  UUIDComponent,
  validateComponentSchema
} from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  NO_PROXY,
  NO_PROXY_STEALTH,
  none,
  State,
  Topic,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { proxifyParentChildRelationships } from '@ir-engine/spatial/src/renderer/functions/proxifyParentChildRelationships'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { ResourceManager, ResourceType } from '@ir-engine/spatial/src/resources/ResourceState'
import { EntityTreeComponent, getAncestorWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { GLTFParserOptions } from '../assets/loaders/gltf/GLTFParser'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFModifiedState, GLTFNodeState, GLTFSnapshotAction } from './GLTFDocumentState'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'
import { MaterialDefinitionComponent } from './MaterialDefinitionComponent'
import './MeshExtensionComponents'

export const GLTFAssetState = defineState({
  name: 'ee.engine.gltf.GLTFAssetState',
  initial: {} as Record<string, Entity>, // sceneID => entity

  loadScene: (sceneURL: string, uuid: string) => {
    const gltfEntity = GLTFSourceState.load(sceneURL, uuid as EntityUUID, getState(EngineState).originEntity)
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
    const entity = createEntity()
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, NameComponent, source.split('/').pop()!)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity })
    const sourceID = `${getComponent(entity, UUIDComponent)}-${source}`
    setComponent(entity, SourceComponent, sourceID)
    setComponent(entity, GLTFComponent, { src: source })
    const obj3d = new Group()
    setComponent(entity, Object3DComponent, obj3d)
    addObjectToGroup(entity, obj3d)
    proxifyParentChildRelationships(obj3d)
    return entity
  },

  unload: (entity: Entity) => {
    removeEntity(entity)
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

  reactor: () => {
    const state = useMutableState(GLTFSnapshotState)
    return (
      <>
        {state.keys.map((source: string) => (
          <ChildGLTFReactor key={source} source={source} />
        ))}
      </>
    )
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

const ChildGLTFReactor = (props: { source: string }) => {
  const source = props.source
  const index = useMutableState(GLTFSnapshotState)[source].index
  const entity = useMutableState(GLTFSourceState)[source].value

  useLayoutEffect(() => {
    return () => {
      getMutableState(GLTFDocumentState)[source].set(none)
      getMutableState(GLTFNodeState)[source].set(none)
    }
  }, [])

  useLayoutEffect(() => {
    const index = getState(GLTFSnapshotState)[source].index
    // update the modified state
    if (index > 0) getMutableState(GLTFModifiedState)[source].set(true)

    // update the document state
    const data = getState(GLTFSnapshotState)[source].snapshots[index]
    getMutableState(GLTFDocumentState)[source].set(data)

    // update the nodes dictionary
    const nodesDictionary = GLTFNodeState.convertGltfToNodeDictionary(data, source)
    getMutableState(GLTFNodeState)[source].set(nodesDictionary)
  }, [index])

  const parentUUID = useOptionalComponent(entity, UUIDComponent)?.value
  const nodeState = useHookstate(getMutableState(GLTFNodeState))[source]
  const documentState = useMutableState(GLTFDocumentState)[source]
  // const physicsWorld = Physics.useWorld(entity)

  if (!documentState.value || !nodeState.value || !parentUUID) return null

  return <DocumentReactor documentID={source} parentUUID={parentUUID} />
}

export const DocumentReactor = (props: { documentID: string; parentUUID: EntityUUID }) => {
  const nodeState = useHookstate(getMutableState(GLTFNodeState))[props.documentID]
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const animationState = useHookstate([] as AnimationClip[])
  const rootEntity = UUIDComponent.useEntityByUUID(props.parentUUID)

  useEffect(() => {
    /** @todo this is a temporary hack */
    const obj3d = new Group()
    setComponent(rootEntity, Object3DComponent, obj3d)
    addObjectToGroup(rootEntity, obj3d)
    proxifyParentChildRelationships(obj3d)

    return () => {
      if (entityExists(rootEntity)) {
        removeObjectFromGroup(rootEntity, getComponent(rootEntity, Object3DComponent))
        removeComponent(rootEntity, Object3DComponent)
      }
    }
  }, [])

  useEffect(() => {
    if (!animationState.length) return

    const obj3d = getComponent(rootEntity, Object3DComponent)
    obj3d.animations = animationState.get(NO_PROXY) as AnimationClip[]
    if (!hasComponent(rootEntity, AnimationComponent)) {
      setComponent(rootEntity, AnimationComponent, {
        mixer: new AnimationMixer(obj3d),
        animations: obj3d.animations
      })
    } else {
      getMutableComponent(rootEntity, AnimationComponent).animations.merge(obj3d.animations)
    }

    return () => {
      if (entityExists(rootEntity)) {
        removeComponent(rootEntity, AnimationComponent)
      }
    }
  }, [animationState])

  const nodes = nodeState.get(NO_PROXY)
  const document = documentState.get(NO_PROXY)
  return (
    <>
      {Object.entries(nodes).map(([uuid, { nodeIndex, childIndex, parentUUID }]) => (
        <ParentNodeReactor
          key={uuid}
          childIndex={childIndex}
          nodeIndex={nodeIndex}
          parentUUID={parentUUID ?? props.parentUUID}
          documentID={props.documentID}
        />
      ))}
      {document.materials?.map((material, index) => (
        <MaterialEntityReactor
          key={'material-' + index}
          index={index}
          parentUUID={props.parentUUID}
          documentID={props.documentID}
        />
      ))}
      {document.animations?.map((animation, index) => {
        return (
          <AnimationReactor
            key={'animation-' + index}
            index={index}
            documentID={props.documentID}
            parentUUID={props.parentUUID}
            animationState={animationState}
          />
        )
      })}
    </>
  )
}

const MaterialEntityReactor = (props: { index: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const materials = documentState.materials!

  const materialDef = materials[props.index]!.get(NO_PROXY) as GLTF.IMaterial

  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)

  const entityState = useHookstate(UndefinedEntity)
  const entity = entityState.value

  useEffect(() => {
    const uuid = (props.documentID + '-material-' + props.index) as EntityUUID
    const entity = UUIDComponent.getOrCreateEntityByUUID(uuid)

    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, SourceComponent, props.documentID)

    /** Ensure all base components are added for synchronous mount */
    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.index })
    setComponent(entity, NameComponent, materialDef.name ?? 'Material-' + props.index)

    entityState.set(entity)

    return () => {
      //check if entity is in some other document
      if (hasComponent(entity, UUIDComponent)) {
        const uuid = getComponent(entity, UUIDComponent)
        const documents = getState(GLTFDocumentState)
        for (const documentID in documents) {
          const document = documents[documentID]
          if (!document?.materials) continue
          for (const material of document.materials) {
            if (material.extensions?.[UUIDComponent.jsonID] === uuid) return
          }
        }
      }
      removeEntity(entity)
    }
  }, [])

  useLayoutEffect(() => {
    if (!entity) return

    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.index })
  }, [entity, parentEntity, props.index])

  useLayoutEffect(() => {
    if (!entity) return

    setComponent(entity, NameComponent, materialDef.name ?? 'Material-' + props.index)
  }, [entity, materialDef.name])

  if (!entity) return null
  return (
    <>
      <MaterialStateReactor
        index={props.index}
        parentUUID={props.parentUUID}
        documentID={props.documentID}
        entity={entity}
      />
    </>
  )
}

const MaterialStateReactor = (props: { index: number; parentUUID: EntityUUID; documentID: string; entity: Entity }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const entity = props.entity

  const materialDefinition = documentState.materials![props.index]!.get(NO_PROXY) as GLTF.IMaterial

  useLayoutEffect(() => {
    if (!materialDefinition) return
    setComponent(entity, MaterialDefinitionComponent, materialDefinition)
    return () => {
      if (entityExists(entity)) removeComponent(entity, MaterialDefinitionComponent)
    }
  }, [materialDefinition])

  return (
    <>
      {materialDefinition.extensions &&
        Object.entries(materialDefinition.extensions).map(([id, ext]) => {
          return <MaterialStateExtensionReactor key={id} keyName={id} value={ext} entity={entity} />
        })}
    </>
  )
}

const MaterialStateExtensionReactor = (props: { keyName: string; value: any; entity: Entity }) => {
  const entity = props.entity

  useEffect(() => {
    const Component = ComponentJSONIDMap.get(props.keyName)
    if (!Component) return console.warn('No component found for extension', props.keyName)

    setComponent(entity, Component, props.value)
    return () => {
      removeComponent(entity, Component)
    }
  }, [props.keyName, props.value])

  return null
}

const ParentNodeReactor = (props: {
  nodeIndex: number
  childIndex: number
  parentUUID: EntityUUID
  documentID: string
}) => {
  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)
  if (!parentEntity) return null

  return <NodeReactor {...props} />
}

export const getNodeUUID = (node: GLTF.INode, documentID: string, nodeIndex: number) =>
  (node.extensions?.[UUIDComponent.jsonID] as EntityUUID) ?? (`${documentID}-${nodeIndex}` as EntityUUID)

const isBoneNode = (json: GLTF.IGLTF, nodeIndex: number) => {
  const skinDefs = json.skins || []
  for (let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
    const joints = skinDefs[skinIndex].joints
    for (let i = 0, il = joints.length; i < il; i++) {
      if (joints[i] === nodeIndex) return true
    }
  }
  return false
}

const NodeReactor = (props: { nodeIndex: number; childIndex: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const nodes = documentState.nodes!
  const node = nodes[props.nodeIndex]! as State<GLTF.INode>

  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)
  const entityState = useHookstate(UndefinedEntity)
  const entity = entityState.value

  useLayoutEffect(() => {
    const uuid = getNodeUUID(node.get(NO_PROXY) as GLTF.IGLTF, props.documentID, props.nodeIndex)
    const entity = UUIDComponent.getOrCreateEntityByUUID(uuid)

    setComponent(entity, SourceComponent, props.documentID)

    /** Ensure all base components are added for synchronous mount */
    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.childIndex })
    setComponent(entity, NameComponent, node.name.value ?? 'Node-' + props.nodeIndex)
    setComponent(entity, TransformComponent)

    if (node.matrix.value) {
      const mat4 = new Matrix4().fromArray(node.matrix.value)
      const position = new Vector3()
      const rotation = new Quaternion()
      const scale = new Vector3()
      mat4.decompose(position, rotation, scale)
      setComponent(entity, TransformComponent, { position, rotation, scale })
    }

    /** Always set visible extension if this is not an ECS node */
    if (!node.extensions.value?.[UUIDComponent.jsonID]) setComponent(entity, VisibleComponent)

    // add all extensions for synchronous mount
    if (node.extensions.value) {
      for (const extension in node.extensions.value) {
        const Component = ComponentJSONIDMap.get(extension)
        if (!Component) continue

        const validatedComponent = validateComponentSchema(Component, node.extensions[extension].get(NO_PROXY_STEALTH))
        node.extensions[extension].set(validatedComponent)
        setComponent(entity, Component, validatedComponent)
      }
    }

    if (!hasComponent(entity, Object3DComponent) && !hasComponent(entity, MeshComponent)) {
      if (isBoneNode(documentState.get(NO_PROXY) as GLTF.IGLTF, props.nodeIndex)) {
        const bone = new Bone()
        bone.name = node.name.value ?? 'Bone-' + props.nodeIndex
        setComponent(entity, BoneComponent, bone)
        addObjectToGroup(entity, bone)
        proxifyParentChildRelationships(bone)
        setComponent(entity, Object3DComponent, bone)
      }
    }

    entityState.set(entity)

    return () => {
      // check if entity is in some other document
      if (hasComponent(entity, UUIDComponent)) {
        const uuid = getComponent(entity, UUIDComponent)
        const documents = getState(GLTFDocumentState)
        for (const documentID in documents) {
          const document = documents[documentID]
          if (!document?.nodes) continue
          for (const node of document.nodes) {
            if (node.extensions?.[UUIDComponent.jsonID] === uuid) return
          }
        }
      }
      /**@todo temp fix for avatars freaking out when child entities are removed after the parent is removed */
      if (getAncestorWithComponents(entity, [GLTFComponent])) removeEntity(entity)
    }
  }, [])

  useLayoutEffect(() => {
    const uuid = getNodeUUID(node.get(NO_PROXY) as GLTF.IGLTF, props.documentID, props.nodeIndex)

    if (!node.extensions?.[UUIDComponent.jsonID]) {
      if (!node.extensions.value)
        node.merge({
          extensions: {
            [UUIDComponent.jsonID]: uuid
          }
        })
      else
        node.extensions.merge({
          [UUIDComponent.jsonID]: uuid
        })
    }
  }, [])

  useLayoutEffect(() => {
    if (!entity || !entityExists(entity)) return

    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.childIndex })
  }, [entity, parentEntity, props.childIndex])

  useLayoutEffect(() => {
    if (!entity) return

    setComponent(entity, NameComponent, node.name.value ?? 'Node-' + props.nodeIndex)
  }, [entity, node.name])

  useLayoutEffect(() => {
    if (!entity || !node.matrix.value) return

    const mat4 = new Matrix4().fromArray(node.matrix.value)
    const position = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()
    mat4.decompose(position, rotation, scale)
    setComponent(entity, TransformComponent, { position, rotation, scale })
  }, [entity, node.matrix])

  useLayoutEffect(() => {
    if (!entity || !node.translation.value) return

    const position = new Vector3().fromArray(node.translation.value)
    setComponent(entity, TransformComponent, { position })
  }, [entity, node.translation])

  useLayoutEffect(() => {
    if (!entity) return

    if (!node.rotation.value) return
    const rotation = new Quaternion().fromArray(node.rotation.value)
    setComponent(entity, TransformComponent, { rotation })
  }, [entity, node.rotation])

  useLayoutEffect(() => {
    if (!entity) return

    if (!node.scale.value) return
    const scale = new Vector3().fromArray(node.scale.value)
    setComponent(entity, TransformComponent, { scale })
  }, [entity, node.scale])

  if (!entity) return null

  return (
    <>
      {typeof node.mesh.get(NO_PROXY) === 'number' && (
        <MeshReactor nodeIndex={props.nodeIndex} documentID={props.documentID} entity={entity} />
      )}
      {typeof node.skin.get(NO_PROXY) === 'number' && (
        <SkinnedMeshReactor nodeIndex={props.nodeIndex} documentID={props.documentID} entity={entity} />
      )}
      {typeof node.camera.get(NO_PROXY) === 'number' && (
        <CameraReactor nodeIndex={props.nodeIndex} documentID={props.documentID} entity={entity} />
      )}
      {node.extensions.value &&
        Object.keys(node.extensions.get(NO_PROXY)!).map((extension) => (
          <ExtensionReactor
            key={extension}
            entity={entity}
            extension={extension}
            nodeIndex={props.nodeIndex}
            documentID={props.documentID}
          />
        ))}
    </>
  )
}

const ExtensionReactor = (props: { entity: Entity; extension: string; nodeIndex: number; documentID: string }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!
  const extension = node.extensions![props.extension]

  const extras = node.extras
  /**@todo detect component use through extras until we have better tooling
   * for artists to define colliders and other components using ecs extensions in Blender
   */
  useEffect(() => {
    if (!extras) return
    const data = [...Object.entries(extras)]
    for (const [key, value] of data) {
      const parts = key.split('.')
      if (parts.length > 1) {
        if (parts[0] === 'xrengine') {
          if (ComponentJSONIDMap.has(parts[1])) {
            const Component = ComponentJSONIDMap.get(parts[1])
            if (!Component) return console.warn('no component found for extension', parts[1])
            setComponent(props.entity, Component)
            if (Component === ColliderComponent) removeComponent(props.entity, VisibleComponent)
          }
        }
      }
    }
  }, [extras])

  useEffect(() => {
    const Component = ComponentJSONIDMap.get(props.extension)
    if (!Component) return
    return () => {
      //check if entity is in some other document and has the component
      const uuid = getOptionalComponent(props.entity, UUIDComponent)
      const documents = getState(GLTFDocumentState)
      for (const documentID in documents) {
        const document = documents[documentID]
        if (!document?.nodes) continue
        for (const node of document.nodes) {
          if (node.extensions?.[UUIDComponent.jsonID] === uuid) {
            if (node.extensions?.[props.extension]) return
          }
        }
      }
      removeComponent(props.entity, Component)
    }
  }, [])

  useLayoutEffect(() => {
    const Component = ComponentJSONIDMap.get(props.extension)
    if (!Component) return console.warn('no component found for extension', props.extension)
    setComponent(props.entity, Component, extension)
  }, [extension])

  return null
}

const MeshReactor = (props: { nodeIndex: number; documentID: string; entity: Entity }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]

  useEffect(() => {
    setComponent(props.entity, VisibleComponent)
  }, [])

  const isSinglePrimitive = mesh.primitives.length === 1
  const gltfEntity = getAncestorWithComponents(props.entity, [GLTFComponent])
  return (
    <>
      {GLTFComponent.getInstanceID(gltfEntity) === props.documentID && (
        <PrimitiveReactor
          key={`${props.entity}-${props.documentID}-${props.nodeIndex}`}
          isSinglePrimitive={isSinglePrimitive}
          nodeIndex={props.nodeIndex}
          documentID={props.documentID}
          entity={props.entity}
        />
      )}
    </>
  )
}

const SkinnedMeshReactor = (props: { nodeIndex: number; documentID: string; entity: Entity }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const skinnedMeshComponent = useOptionalComponent(props.entity, SkinnedMeshComponent)
  const skin = documentState.skins.get(NO_PROXY)![node.skin!]

  const options = getParserOptions(props.entity)
  const inverseBindMatrices = GLTFLoaderFunctions.useLoadAccessor(options, skin.inverseBindMatrices)

  const jointNodeUUIDs = skin.joints.map((joint) =>
    getNodeUUID(nodes[joint] as GLTF.INode, props.documentID, joint)
  ) as EntityUUID[]
  /** @todo make reactive to edits */
  const jointEntityLoadedState = useHookstate(() =>
    Object.fromEntries(jointNodeUUIDs.map((uuid) => [uuid, UndefinedEntity]))
  )

  useEffect(() => {
    if (!inverseBindMatrices || !skinnedMeshComponent) return

    const jointEntities = Object.values(jointEntityLoadedState.value)
    if (jointEntities.includes(UndefinedEntity)) return

    const jointBones = jointEntities.map((entity) => getOptionalComponent(entity, BoneComponent))
    if (jointBones.includes(undefined)) return

    const bones = [] as Bone[]
    const boneInverses = [] as Matrix4[]

    for (let i = 0, il = jointBones.length; i < il; i++) {
      const jointNode = jointBones[i]

      if (jointNode) {
        bones.push(jointNode)

        const mat = new Matrix4()

        if (inverseBindMatrices !== null) {
          mat.fromArray(inverseBindMatrices.array, i * 16)
        }

        boneInverses.push(mat)
      } else {
        // console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinDef.joints[i])
      }
    }

    const skeleton = new Skeleton(bones, boneInverses)
    skinnedMeshComponent.skeleton.set(skeleton)

    const url = options.url
    ResourceManager.addReferencedAsset(url, skeleton as unknown as Object3D, ResourceType.Object3D)
    return () => {
      ResourceManager.removeReferencedAsset(url, skeleton as unknown as Object3D, ResourceType.Object3D)
    }
  }, [jointEntityLoadedState, inverseBindMatrices, !!skinnedMeshComponent])

  return (
    <>
      {jointEntityLoadedState.keys.map((entityUUID: EntityUUID) => (
        <SkeletonNodeDependencyReactor
          key={entityUUID}
          entityUUID={entityUUID}
          jointEntityLoadedState={jointEntityLoadedState}
        />
      ))}
    </>
  )
}

/** @todo we can probably simplify this into a nested reactor in a 'useNodesLoaded' entity */
const SkeletonNodeDependencyReactor = (props: {
  entityUUID: EntityUUID
  jointEntityLoadedState: State<Record<EntityUUID, Entity>>
}) => {
  const entity = UUIDComponent.useEntityByUUID(props.entityUUID)
  const jointEntityLoadedState = props.jointEntityLoadedState

  useEffect(() => {
    if (!entity) return
    jointEntityLoadedState[props.entityUUID].set(entity)
    return () => jointEntityLoadedState[props.entityUUID].set(UndefinedEntity)
  }, [entity])

  return null
}

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

const defaultMaterial = () =>
  new MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x000000,
    metalness: 0,
    roughness: 1,
    transparent: false,
    depthTest: true,
    side: FrontSide
  })

const PrimitiveReactor = (props: {
  isSinglePrimitive: boolean
  nodeIndex: number
  documentID: string
  entity: Entity
}) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]! as GLTF.INode

  const meshDef = documentState.meshes.get(NO_PROXY)![node.mesh!]
  const options = getParserOptions(props.entity)
  const finalGeometry = GLTFLoaderFunctions.useLoadPrimitives(options, props.nodeIndex!)

  useEffect(() => {
    return () => {
      if (!props.isSinglePrimitive) removeEntity(props.entity)
    }
  }, [])

  useLayoutEffect(() => {
    if (!finalGeometry) return

    //For debug visualization of material indices
    // setComponent(props.entity, MaterialInstanceComponent)
    // const array = [] as Material[]
    // meshDef.primitives.map((primitive) => {
    //   const materialUUID = (props.documentID + '-material-' + primitive.material!) as EntityUUID
    //   array[primitive.material!] = getComponent(UUIDComponent.getEntityByUUID(materialUUID), MaterialStateComponent).material
    // })

    const material = props.isSinglePrimitive ? defaultMaterial() : meshDef.primitives.map(() => defaultMaterial())
    const mesh =
      typeof node.skin !== 'undefined'
        ? new SkinnedMesh(finalGeometry as BufferGeometry)
        : new Mesh(finalGeometry as BufferGeometry)

    mesh.material = material

    if (typeof node.skin !== 'undefined') {
      ;(mesh as SkinnedMesh).skeleton = new Skeleton()
      ;(mesh as SkinnedMesh).normalizeSkinWeights()
      setComponent(props.entity, SkinnedMeshComponent, mesh as SkinnedMesh)
    }

    setComponent(props.entity, MeshComponent, mesh)
    addObjectToGroup(props.entity, mesh)
    proxifyParentChildRelationships(mesh)
    mesh.name = node.name ?? 'Node-' + props.nodeIndex

    const url = options.url
    ResourceManager.addReferencedAsset(url, mesh, ResourceType.Mesh)
    return () => {
      ResourceManager.removeReferencedAsset(url, mesh, ResourceType.Mesh)
      if (entityExists(props.entity)) {
        removeComponent(props.entity, SkinnedMeshComponent)
        removeComponent(props.entity, MeshComponent)
        removeObjectFromGroup(props.entity, mesh)
      }
    }
  }, [node.skin, finalGeometry])

  return (
    <>
      {meshDef.primitives.map((primitive, index) => (
        <React.Fragment key={`${index}-${props.nodeIndex}`}>
          <MaterialInstanceReactor
            key={`materials-${index}-${props.nodeIndex}`}
            nodeIndex={props.nodeIndex}
            primitiveIndex={index}
            documentID={props.documentID}
            entity={props.entity}
            isArray={meshDef.primitives.length > 1}
          />
          <PrimitiveExtensionReactor
            key={`primitives-${index}-${props.nodeIndex}`}
            nodeIndex={props.nodeIndex}
            primitiveIndex={index}
            documentID={props.documentID}
            entity={props.entity}
          />
        </React.Fragment>
      ))}

      <MorphTargetReactor
        key={`targets-${props.nodeIndex}-${props.entity}`}
        documentID={props.documentID}
        entity={props.entity}
        nodeIndex={props.nodeIndex}
      />
    </>
  )
}

const PrimitiveExtensionReactor = (props: {
  nodeIndex: number
  primitiveIndex: number
  documentID: string
  entity: Entity
}) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]
  const primitive = mesh.primitives[props.primitiveIndex]
  const extensions = primitive.extensions

  useEffect(() => {
    if (!extensions) return
    for (const extension in extensions) {
      console.log(extension)
      const Component = ComponentJSONIDMap.get(extension)
      console.log(Component)
      if (!Component) continue
      setComponent(props.entity, Component, extensions[extension])
    }
  }, [extensions])

  return null
}

const MaterialInstanceReactor = (props: {
  nodeIndex: number
  documentID: string
  primitiveIndex: number
  entity: Entity
  isArray: boolean
}) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]
  const primitive = mesh.primitives[props.primitiveIndex]

  const materialUUID = (props.documentID + '-material-' + primitive.material!) as EntityUUID
  const materialEntity = UUIDComponent.useEntityByUUID(materialUUID)

  useEffect(() => {
    if (typeof primitive.material !== 'number' || !materialEntity) return

    setComponent(props.entity, MaterialInstanceComponent)
    const materialInstance = getMutableComponent(props.entity, MaterialInstanceComponent)
    /** @todo This creates a sparse array, which leads to the mesh materials array being a sparse array*/
    if (props.isArray) materialInstance.uuid[primitive.material].set(materialUUID)
    else materialInstance.uuid.set([materialUUID])
  }, [materialEntity, primitive.material])

  const material = useOptionalComponent(materialEntity, MaterialStateComponent)?.material
  const useDerivativeTangents = primitive.attributes.TANGENT === undefined
  const useVertexColors = primitive.attributes.COLOR_0 !== undefined
  const useFlatShading = primitive.attributes.NORMAL === undefined

  useEffect(() => {
    const material = getOptionalComponent(materialEntity, MaterialStateComponent)?.material as MeshPhysicalMaterial
    if (!material) return

    if (useVertexColors) material.vertexColors = true
    if (useFlatShading) material.flatShading = true

    if (useDerivativeTangents) {
      // https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
      if (material.normalScale) material.normalScale.y *= -1
      if (material.clearcoatNormalScale) material.clearcoatNormalScale.y *= -1
    }
  }, [!!material, useDerivativeTangents || useVertexColors || useFlatShading])

  return null
}

export const MorphTargetReactor = (props: { documentID: string; entity: Entity; nodeIndex: number }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const meshDef = documentState.meshes.get(NO_PROXY)![node.mesh!]
  const options = getParserOptions(props.entity)
  const loadedMorphTargets = GLTFLoaderFunctions.useMergeMorphTargets(options, props.nodeIndex)

  const mesh = useOptionalComponent(props.entity, MeshComponent)

  useEffect(() => {
    if (!loadedMorphTargets) return

    if (!mesh?.value) return

    if (loadedMorphTargets.POSITION) mesh.geometry.morphAttributes.position.set(loadedMorphTargets.POSITION)
    if (loadedMorphTargets.NORMAL) mesh.geometry.morphAttributes.normal.set(loadedMorphTargets.NORMAL)
    if (loadedMorphTargets.COLOR_0) mesh.geometry.morphAttributes.color.set(loadedMorphTargets.COLOR_0)

    mesh.geometry.morphTargetsRelative.set(true)
    mesh.get(NO_PROXY).updateMorphTargets()

    if (meshDef.weights) {
      for (let i = 0, il = meshDef.weights.length; i < il; i++) {
        mesh.morphTargetInfluences[i].set(meshDef.weights[i])
      }
    }
  }, [loadedMorphTargets, !!mesh?.value])

  return null
}

export const AnimationReactor = (props: {
  index: number
  documentID: string
  parentUUID: EntityUUID
  animationState: State<AnimationClip[]>
}) => {
  const entity = UUIDComponent.useEntityByUUID(props.parentUUID)
  const options = getParserOptions(entity)
  const animationTrack = GLTFLoaderFunctions.useLoadAnimation(options, props.index)

  useEffect(() => {
    if (!animationTrack) return
    props.animationState.merge([animationTrack])
  }, [animationTrack])

  return null
}

export const getParserOptions = (entity: Entity) => {
  const gltfEntity = getAncestorWithComponents(entity, [GLTFComponent])
  const documentID = GLTFComponent.getInstanceID(gltfEntity)
  const gltfComponent = getComponent(gltfEntity, GLTFComponent)
  const document = getState(GLTFDocumentState)[documentID]
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  return {
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
