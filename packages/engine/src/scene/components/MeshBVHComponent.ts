/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  defineComponent,
  getOptionalComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { useEffect } from 'react'
import { BufferGeometry, InstancedMesh, LineBasicMaterial, Mesh, Object3D, SkinnedMesh } from 'three'
import { MeshBVHHelper, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { ModelComponent } from './ModelComponent'

Mesh.prototype.raycast = acceleratedRaycast
BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree
BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree

const edgeMaterial = new LineBasicMaterial({
  color: 0x00ff88,
  transparent: true,
  opacity: 0.3,
  depthWrite: false
})

function ValidMeshForBVH(mesh: Mesh | undefined): boolean {
  return (
    mesh !== undefined &&
    mesh.isMesh &&
    !(mesh as InstancedMesh).isInstancedMesh &&
    !(mesh as SkinnedMesh).isSkinnedMesh
  )
}

export const MeshBVHComponent = defineComponent({
  name: 'MeshBVHComponent',

  onInit(entity) {
    return {
      generated: false
    }
  },

  onSet(entity, component, json) {
    if (!json) return
  },

  toJSON(entity, component) {
    return {
      generated: component.generated.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MeshBVHComponent)
    const debug = useHookstate(getMutableState(RendererState).physicsDebug)
    const visible = useOptionalComponent(entity, VisibleComponent)
    const model = useComponent(entity, ModelComponent)
    const childEntities = useHookstate(ModelComponent.entitiesInModelHierarchyState[entity])
    const abortControllerState = useHookstate(new AbortController())

    useEffect(() => {
      const abortController = abortControllerState.get(NO_PROXY)

      return () => {
        abortController.abort()
      }
    }, [])

    useEffect(() => {
      if (!component.generated.value && visible?.value) {
        const abortController = abortControllerState.get(NO_PROXY)
        const entities = childEntities.value
        const cameraOcclusion = model.cameraOcclusion.get(NO_PROXY)
        let toGenerate = 0
        for (const currEntity of entities) {
          const mesh = getOptionalComponent(currEntity, MeshComponent)
          if (ValidMeshForBVH(mesh)) {
            toGenerate += 1
            generateMeshBVH(mesh!, abortController.signal).then(() => {
              if (!abortController.signal.aborted) {
                toGenerate -= 1
                if (toGenerate == 0) {
                  component.generated.set(true)
                }
                if (cameraOcclusion) {
                  ObjectLayerMaskComponent.enableLayers(currEntity, ObjectLayers.Camera)
                }
              }
            })
          }
        }
      }
    }, [visible, childEntities])

    useEffect(() => {
      if (!component.generated.value) return

      const visualizers = [] as Object3D[]
      if (debug.value) {
        const entities = childEntities.value
        for (const currEntity of entities) {
          const mesh = getOptionalComponent(currEntity, MeshComponent)
          if (ValidMeshForBVH(mesh!)) {
            const meshBVHVisualizer = new MeshBVHHelper(mesh!)
            meshBVHVisualizer.edgeMaterial = edgeMaterial
            meshBVHVisualizer.depth = 20
            meshBVHVisualizer.displayParents = false
            meshBVHVisualizer.update()

            addObjectToGroup(currEntity, meshBVHVisualizer)
            visualizers.push(meshBVHVisualizer)
          }
        }
      }

      return () => {
        if (visualizers) {
          for (const visualizer of visualizers) {
            removeObjectFromGroup(visualizer.entity, visualizer)
          }
        }
      }
    }, [component.generated, debug])

    return null
  }
})
