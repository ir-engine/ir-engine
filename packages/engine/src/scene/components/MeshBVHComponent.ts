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
  useComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Box3, LineBasicMaterial, Mesh, MeshBasicMaterial, Object3D } from 'three'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { MeshComponent } from './MeshComponent'
import { ModelComponent } from './ModelComponent'
import { ObjectLayerMaskComponent } from './ObjectLayerComponent'
import { VisibleComponent } from './VisibleComponent'

const edgeMaterial = new LineBasicMaterial({
  color: 0x00ff88,
  transparent: true,
  opacity: 0.3,
  depthWrite: false
})

const meshMaterial = new MeshBasicMaterial({
  color: 0x00ff88,
  transparent: true,
  opacity: 0.3,
  depthWrite: false
})

function arrayToBox(nodeIndex32: number, array: ArrayBuffer, target: Box3) {
  target.min.x = array[nodeIndex32]
  target.min.y = array[nodeIndex32 + 1]
  target.min.z = array[nodeIndex32 + 2]

  target.max.x = array[nodeIndex32 + 3]
  target.max.y = array[nodeIndex32 + 4]
  target.max.z = array[nodeIndex32 + 5]

  return target
}

const boundingBox$1 = /* @__PURE__ */ new Box3()

const GetMeshBVHGeometry = (
  mesh: Mesh,
  depth = 10,
  group = 0,
  displayParents = false,
  displayEdges = true
): { indexArray: ArrayLike<number>; positionArray: Float32Array } | null => {
  const boundsTree = mesh.geometry.boundsTree
  if (boundsTree) {
    // count the number of bounds required
    const targetDepth = depth - 1
    let boundsCount = 0
    boundsTree.traverse((depth, isLeaf) => {
      if (depth === targetDepth || isLeaf) {
        boundsCount++
        return true
      } else if (displayParents) {
        boundsCount++
      }
    }, group)

    // fill in the position buffer with the bounds corners
    let posIndex = 0
    const positionArray = new Float32Array(8 * 3 * boundsCount)
    boundsTree.traverse((depth, isLeaf, boundingData) => {
      const terminate = depth === targetDepth || isLeaf
      if (terminate || displayParents) {
        arrayToBox(0, boundingData, boundingBox$1)

        const { min, max } = boundingBox$1
        for (let x = -1; x <= 1; x += 2) {
          const xVal = x < 0 ? min.x : max.x
          for (let y = -1; y <= 1; y += 2) {
            const yVal = y < 0 ? min.y : max.y
            for (let z = -1; z <= 1; z += 2) {
              const zVal = z < 0 ? min.z : max.z
              positionArray[posIndex + 0] = xVal
              positionArray[posIndex + 1] = yVal
              positionArray[posIndex + 2] = zVal

              posIndex += 3
            }
          }
        }

        return terminate
      }
    }, group)

    let indexArray
    let indices
    if (displayEdges) {
      // fill in the index buffer to point to the corner points
      indices = new Uint8Array([
        // x axis
        0, 4, 1, 5, 2, 6, 3, 7,

        // y axis
        0, 2, 1, 3, 4, 6, 5, 7,

        // z axis
        0, 1, 2, 3, 4, 5, 6, 7
      ])
    } else {
      indices = new Uint8Array([
        // X-, X+
        0, 1, 2, 2, 1, 3,

        4, 6, 5, 6, 7, 5,

        // Y-, Y+
        1, 4, 5, 0, 4, 1,

        2, 3, 6, 3, 7, 6,

        // Z-, Z+
        0, 2, 4, 2, 6, 4,

        1, 5, 3, 3, 5, 7
      ])
    }

    if (positionArray.length > 65535) {
      indexArray = new Uint32Array(indices.length * boundsCount)
    } else {
      indexArray = new Uint16Array(indices.length * boundsCount)
    }

    const indexLength = indices.length
    for (let i = 0; i < boundsCount; i++) {
      const posOffset = i * 8
      const indexOffset = i * indexLength
      for (let j = 0; j < indexLength; j++) {
        indexArray[indexOffset + j] = posOffset + indices[j]
      }
    }

    return { indexArray, positionArray }
  }

  return null
}

export const MeshBVHComponent = defineComponent({
  name: 'MeshBVHComponent',

  onInit(entity) {
    return {
      generated: false,
      visualizer: null as Object3D | null
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (json.visualizer) component.visualizer.set(json.visualizer)
  },

  toJSON(entity, component) {
    return {
      generated: component.generated.value,
      visualizer: component.visualizer.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MeshBVHComponent)
    const debug = useHookstate(getMutableState(RendererState).physicsDebug)
    const visible = useOptionalComponent(entity, VisibleComponent)
    const model = useOptionalComponent(entity, ModelComponent)

    useEffect(() => {
      let aborted = false
      if (!component.generated.value && visible?.value) {
        const entities = ModelComponent.entitiesInModelHierarchyState[entity]
        const toGenerate = entities.length
        let generated = 0
        for (const currEntity of entities) {
          const mesh = useComponent(currEntity.value, MeshComponent)
          generateMeshBVH(mesh.value).then(() => {
            if (!aborted) {
              generated += 1
              if (generated >= toGenerate) {
                component.generated.set(true)
              }
              if (model && model.cameraOcclusion) {
                ObjectLayerMaskComponent.enableLayers(entity, ObjectLayers.Camera)
              }
            }
          })
        }
      }

      return () => {
        aborted = true
      }
    }, [visible])

    useEffect(() => {
      const visualizer = new Mesh()
      const indexArrays = [] as ArrayLike<number>[]
      const positions = [] as Float32Array[]

      const entities = ModelComponent.entitiesInModelHierarchyState[entity]
      for (const currEntity of entities) {
        const mesh = useComponent(currEntity.value, MeshComponent)
        const data = GetMeshBVHGeometry(mesh.value)
        if (data && data.indexArray && data.positionArray) {
          indexArrays.push(data.indexArray)
          positions.push(data.positionArray)
        }
      }

      visualizer.material = edgeMaterial

      // let meshBVHVisualizer = null as MeshBVHVisualizer | null

      // const remove = () => {
      //   if (meshBVHVisualizer) {
      //     removeObjectFromGroup(entity, meshBVHVisualizer)
      //     //The MeshBVHVisualizer type def is missing the dispose method
      //     ;(meshBVHVisualizer as any).dispose()
      //   }
      // }

      // if (component.generated.value && debug.value) {
      //   meshBVHVisualizer = new MeshBVHVisualizer(component.mesh.value)
      //   addObjectToGroup(entity, meshBVHVisualizer)

      //   meshBVHVisualizer.depth = 20
      //   meshBVHVisualizer.displayParents = false
      //   meshBVHVisualizer.update()
      //   component.visualizer.set(meshBVHVisualizer)
      // } else if (component.visualizer.value && !debug.value) {
      //   remove()
      //   component.visualizer.set(null)
      // }

      return () => {
        // remove()
      }
    }, [component.generated, debug])

    return null
  }
})
