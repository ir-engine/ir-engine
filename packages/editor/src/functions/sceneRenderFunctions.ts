import { Group, Object3D, Scene, Vector3, WebGLInfo } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { accessEngineRendererState, EngineRendererAction } from '@xrengine/engine/src/renderer/EngineRendererState'
import { configureEffectComposer } from '@xrengine/engine/src/renderer/functions/configureEffectComposer'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'

import EditorInfiniteGridHelper from '../classes/EditorInfiniteGridHelper'
import { RenderModes, RenderModesType } from '../constants/RenderModes'
import { ActionSets, EditorMapping } from '../controls/input-mappings'
import { initInputEvents } from '../controls/InputEvents'
import { EditorAction } from '../services/EditorServices'
import { accessModeState } from '../services/ModeServices'
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
  grid: EditorInfiniteGridHelper
  transformGizmo: TransformGizmo
  gizmoEntity: Entity
  editorEntity: Entity
  onUpdateStats?: (info: WebGLInfo) => void
  renderMode: RenderModesType
}

export const SceneState: SceneStateType = {
  isInitialized: false,
  grid: null!,
  transformGizmo: null!,
  gizmoEntity: null!,
  editorEntity: null!,
  renderMode: RenderModes.SHADOW
}

export async function initializeScene(projectFile: SceneJson): Promise<Error[] | void> {
  EngineRenderer.instance.disableUpdate = true
  if (SceneState.isInitialized) disposeScene()

  SceneState.isInitialized = false

  if (!Engine.scene) Engine.scene = new Scene()

  // getting scene data
  await loadSceneFromJSON(projectFile)

  Engine.camera.position.set(0, 5, 10)
  Engine.camera.lookAt(new Vector3())
  Engine.camera.layers.enable(ObjectLayers.Scene)
  Engine.camera.layers.enable(ObjectLayers.NodeHelper)
  Engine.camera.layers.enable(ObjectLayers.Gizmos)

  SceneState.grid = new EditorInfiniteGridHelper()
  SceneState.transformGizmo = new TransformGizmo()

  SceneState.gizmoEntity = createGizmoEntity(SceneState.transformGizmo)
  Engine.activeCameraEntity = createCameraEntity()
  SceneState.editorEntity = createEditorEntity()

  Engine.scene.add(Engine.camera)
  Engine.scene.add(SceneState.grid)
  Engine.scene.add(SceneState.transformGizmo)

  SceneState.isInitialized = true

  return []
}

/**
 * Function initializeRenderer used to render canvas.
 *
 * @author Robert Long
 * @param  {any} canvas [ contains canvas data ]
 */
export function initializeRenderer(): void {
  try {
    initInputEvents()

    addInputActionMapping(ActionSets.EDITOR, EditorMapping)

    dispatchLocal(
      EngineActions.enableScene({
        renderer: true,
        physics: true
      }) as any
    )

    dispatchLocal(EngineActions.setPhysicsDebug(true) as any)

    SceneState.grid.setSize(accessModeState().translationSnap.value)

    configureEffectComposer()

    store.dispatch(EditorAction.rendererInitialized(true))
    EngineRenderer.instance.disableUpdate = false

    accessEngineRendererState().automatic.set(false)
    dispatchLocal(EngineRendererAction.setQualityLevel(EngineRenderer.instance.maxQualityLevel))
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

  executeCommand(EditorCommands.REPLACE_SELECTION, [])

  if ((Engine.scene as any).entity == undefined) {
    ;(Engine.scene as any).entity = useWorld().entityTree.rootNode.entity
  }

  const clonedScene = serializeForGLTFExport(Engine.scene)

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
  if (Engine.activeCameraEntity) removeEntity(Engine.activeCameraEntity, true)
  if (SceneState.gizmoEntity) removeEntity(SceneState.gizmoEntity, true)
  if (SceneState.editorEntity) removeEntity(SceneState.editorEntity, true)

  if (Engine.scene) {
    if (SceneState.grid) Engine.scene.remove(SceneState.grid)

    // Empty existing scene
    Engine.scene.traverse((child: any) => {
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
    const eTree = Engine.currentWorld.entityTree
    for (const entity of Array.from(eTree.entityNodeMap.keys())) {
      removeEntity(entity, true)
    }
    emptyEntityTree(eTree)
    eTree.uuidNodeMap.clear()
    Engine.scene.clear()
  }

  SceneState.isInitialized = false
}
