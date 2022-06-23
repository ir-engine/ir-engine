import { Group, Object3D, Scene, Vector3, WebGLInfo } from 'three'

import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import {
  accessEngineRendererState,
  EngineRendererAction,
  restoreEngineRendererData
} from '@xrengine/engine/src/renderer/EngineRendererState'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import InfiniteGridHelper from '@xrengine/engine/src/scene/classes/InfiniteGridHelper'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { dispatchAction } from '@xrengine/hyperflux'

import { ActionSets, EditorMapping } from '../controls/input-mappings'
import { initInputEvents } from '../controls/InputEvents'
import { restoreEditorHelperData } from '../services/EditorHelperState'
import { EditorAction } from '../services/EditorServices'
import { createCameraEntity } from './createCameraEntity'
import { createEditorEntity } from './createEditorEntity'
import { createGizmoEntity } from './createGizmoEntity'
import { addInputActionMapping } from './parseInputActionMapping'

export type DefaultExportOptionsType = {
  shouldCombineMeshes: boolean
  shouldRemoveUnusedObjects: boolean
}

export const DefaultExportOptions: DefaultExportOptionsType = {
  shouldCombineMeshes: true,
  shouldRemoveUnusedObjects: true
}

type SceneStateType = {
  isInitialized: boolean
  transformGizmo: TransformGizmo
  gizmoEntity: Entity
  editorEntity: Entity
  onUpdateStats?: (info: WebGLInfo) => void
}

export const SceneState: SceneStateType = {
  isInitialized: false,
  transformGizmo: null!,
  gizmoEntity: null!,
  editorEntity: null!
}

export async function initializeScene(projectFile: SceneJson): Promise<Error[] | void> {
  SceneState.isInitialized = false

  if (!Engine.instance.currentWorld.scene) Engine.instance.currentWorld.scene = new Scene()

  // getting scene data
  await loadSceneFromJSON(projectFile, [])

  Engine.instance.currentWorld.camera.position.set(0, 5, 10)
  Engine.instance.currentWorld.camera.lookAt(new Vector3())
  Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.Scene)
  Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.NodeHelper)
  Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.Gizmos)

  SceneState.transformGizmo = new TransformGizmo()

  SceneState.gizmoEntity = createGizmoEntity(SceneState.transformGizmo)
  Engine.instance.currentWorld.activeCameraEntity = createCameraEntity()
  SceneState.editorEntity = createEditorEntity()

  Engine.instance.currentWorld.scene.add(Engine.instance.currentWorld.camera)
  Engine.instance.currentWorld.scene.add(SceneState.transformGizmo)

  // Require when changing scene
  if (!Engine.instance.currentWorld.scene.children.includes(InfiniteGridHelper.instance)) {
    InfiniteGridHelper.instance = new InfiniteGridHelper()
    Engine.instance.currentWorld.scene.add(InfiniteGridHelper.instance)
  }

  SceneState.isInitialized = true

  return []
}

/**
 * Function initializeRenderer used to render canvas.
 *
 * @author Robert Long
 * @param  {any} canvas [ contains canvas data ]
 */
export async function initializeRenderer(): Promise<void> {
  try {
    initInputEvents()

    addInputActionMapping(ActionSets.EDITOR, EditorMapping)

    dispatchAction(EditorAction.rendererInitialized({ initialized: true }))

    accessEngineRendererState().automatic.set(false)
    await restoreEditorHelperData()
    await restoreEngineRendererData()
    dispatchAction(EngineRendererAction.setQualityLevel({ qualityLevel: EngineRenderer.instance.maxQualityLevel }))
  } catch (error) {
    console.error(error)
  }
}

function removeUnusedObjects(object3d: Object3D) {
  function hasExtrasOrExtensions(object) {
    const userData = object.userData
    const keys = Object.keys(userData)
    for (const key of keys) {
      if (typeof userData[key] !== 'undefined') {
        return true
      }
    }
    return false
  }

  function _removeUnusedObjects(object: Object3D) {
    let canBeRemoved = !!object.parent
    const children = object.children?.slice(0)

    if (children) {
      for (const child of children) {
        if (!_removeUnusedObjects(child)) {
          canBeRemoved = false
        }
      }
    }

    if (
      canBeRemoved &&
      object.children.length === 0 &&
      (object.constructor === Object3D || object.constructor === Scene || object.constructor === Group) &&
      !hasExtrasOrExtensions(object)
    ) {
      object.parent?.remove(object)
      return true
    }

    return false
  }

  _removeUnusedObjects(object3d)
}

/**
 * Function exportScene used to export scene.
 *
 * @author Robert Long
 * @param  {any}  signal       [show the Network status]
 * @param  {Object}  [options={}]
 * @return {Promise}              [scene data as object]
 */
/*
export async function exportScene(options = {} as DefaultExportOptionsType) {
  const { shouldCombineMeshes, shouldRemoveUnusedObjects } = Object.assign({}, DefaultExportOptions, options)

  executeCommand({ type: EditorCommands.REPLACE_SELECTION, affectedNodes: [] })

  if ((Engine.instance.currentWorld.scene as any).entity == undefined) {
    ;(Engine.instance.currentWorld.scene as any).entity = useWorld().entityTree.rootNode.entity
  }

  const clonedScene = serializeForGLTFExport(Engine.instance.currentWorld.scene)

  if (shouldCombineMeshes) await MeshCombinationGroup.combineMeshes(clonedScene)
  if (shouldRemoveUnusedObjects) removeUnusedObjects(clonedScene)

  const exporter = new GLTFExporter({
    mode: 'glb',
    onlyVisible: false,
    includeCustomExtensions: true,
    animations: getAnimationClips()
  })

  let chunks

  try {
    chunks = await exporter.exportChunks(clonedScene)
  } catch (error) {
    throw new RethrownError(`Error exporting scene`, error)
  }

  const json = chunks.json

  const nodeDefs = json.nodes
  if (nodeDefs) {
    const uuidToIndexMap = {}

    for (let i = 0; i < nodeDefs.length; i++) {
      const nodeDef = nodeDefs[i]

      if (nodeDef.extras && nodeDef.extras.editor_uuid) {
        uuidToIndexMap[nodeDef.extras.editor_uuid] = i
        delete nodeDef.extras.editor_uuid

        if (isEmptyObject(nodeDef.extras)) {
          delete nodeDef.extras
        }
      }
    }
  }

  try {
    const glbBlob = await exporter.exportGLBBlob(chunks)
    return { glbBlob, chunks }
  } catch (error) {
    throw new RethrownError('Error creating glb blob', error)
  }
}*/

export function disposeScene() {
  EngineRenderer.instance.activeCSMLightEntity = null
  EngineRenderer.instance.directionalLightEntities = []
  if (Engine.instance.currentWorld.activeCameraEntity)
    removeEntity(Engine.instance.currentWorld.activeCameraEntity, true)
  if (SceneState.gizmoEntity) removeEntity(SceneState.gizmoEntity, true)
  if (SceneState.editorEntity) removeEntity(SceneState.editorEntity, true)

  if (Engine.instance.currentWorld.scene) {
    // Empty existing scene
    Engine.instance.currentWorld.scene.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose()

      if (child.material) {
        if (child.material.length) {
          for (let i = 0; i < child.material.length; ++i) {
            child.material[i].dispose()
          }
        } else {
          child.material.dispose()
        }
      }
    })

    //clear ecs
    const eTree = Engine.instance.currentWorld.entityTree
    for (const entity of Array.from(eTree.entityNodeMap.keys())) {
      removeEntity(entity, true)
    }
    emptyEntityTree(eTree)
    eTree.entityNodeMap.clear()
    eTree.uuidNodeMap.clear()
    Engine.instance.currentWorld.scene.clear()
  }

  SceneState.isInitialized = false
}
