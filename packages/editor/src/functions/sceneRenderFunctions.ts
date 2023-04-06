import { Group, Object3D, Scene } from 'three'

export type DefaultExportOptionsType = {
  shouldCombineMeshes: boolean
  shouldRemoveUnusedObjects: boolean
}

export const DefaultExportOptions: DefaultExportOptionsType = {
  shouldCombineMeshes: true,
  shouldRemoveUnusedObjects: true
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
 * @param  {any}  signal       [show the Network status]
 * @param  {Object}  [options={}]
 * @return {Promise}              [scene data as object]
 */
/*
export async function exportScene(options = {} as DefaultExportOptionsType) {
  const { shouldCombineMeshes, shouldRemoveUnusedObjects } = Object.assign({}, DefaultExportOptions, options)

  executeCommand({ type: EditorCommands.REPLACE_SELECTION, affectedNodes: [] })

  if ((Engine.instance.scene as any).entity == undefined) {
    ;(Engine.instance.scene as any).entity = getState(SceneState).sceneEntity
  }

  const clonedScene = serializeForGLTFExport(Engine.instance.scene)

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
