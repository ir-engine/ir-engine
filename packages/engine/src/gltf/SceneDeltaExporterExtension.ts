import { getComponent, iterateEntityNode } from '@ir-engine/ecs'
import { SceneDeltaRegistry, SceneDeltaState } from '@ir-engine/ecs/src/SceneDeltaState'
import { getState } from '@ir-engine/hyperflux'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFSceneExportExtension } from './exportGLTFScene'
import { GLTFComponent } from './GLTFComponent'
import { NodeIDComponent } from './NodeIDComponent'

export const SCENE_DELTA_EXTENSION_NAME = 'IR_scene_delta'

export const SceneDeltaExporterExtension: GLTFSceneExportExtension = {
  after: (rootEntity, gltf) => {
    iterateEntityNode(rootEntity, (entity) => {
      if (entity === rootEntity) return
      const sourceID = getComponent(entity, SourceComponent)
      const rootSource = GLTFComponent.getInstanceID(rootEntity)
      if (sourceID === rootSource) return
      const deltaState = getState(SceneDeltaState)
      const sourceDelta = deltaState[sourceID]
      if (!sourceDelta) return
      const nodeID = getComponent(entity, NodeIDComponent)
      const nodeDelta = sourceDelta[nodeID]
      if (!nodeDelta) return
      gltf.extensions ??= {}
      const extensions: Record<string, any> = gltf.extensions
      extensions[SCENE_DELTA_EXTENSION_NAME] ??= {}
      const extension: SceneDeltaRegistry = extensions[SCENE_DELTA_EXTENSION_NAME]
      extension[sourceID] ??= {}
      extension[sourceID][nodeID] = nodeDelta
    })
  }
}
