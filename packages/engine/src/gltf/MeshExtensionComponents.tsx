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

import { Mesh } from '@gltf-transform/core'
import {
  ComponentType,
  defineComponent,
  EntityTreeComponent,
  getAncestorWithComponents,
  getComponent,
  removeComponent,
  S,
  setComponent,
  useComponent,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import { DirectionalLightComponent, PointLightComponent, SpotLightComponent } from '@ir-engine/spatial'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { useEffect } from 'react'
import { BufferAttribute, Color, InstancedBufferAttribute, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { InstancingComponent } from '../scene/components/InstancingComponent'
import { getGLTFOptions, GLTFComponent } from './GLTFComponent'
import { WEBGL_CONSTANTS } from './GLTFConstants'
import { getDependency, getNodeID, GLTFParserOptions } from './GLTFLoaderFunctions'
import { NodeIDComponent } from './NodeIDComponent'

export type KHRPunctualLight = {
  color?: [number, number, number]
  intensity?: number
  range?: number
  type: 'directional' | 'point' | 'spot'
  spot?: {
    innerConeAngle?: number
    outerConeAngle?: number
  }
}

export const KHRLightsPunctualComponent = defineComponent({
  name: 'KHRLightsPunctualComponent',
  jsonID: 'KHR_lights_punctual',
  schema: S.Object({
    light: S.Optional(S.Number())
  }),

  /** @todo need to refactor this into whatever API three uses, as we clean up the buffers before it can be loaded */
  reactor: () => {
    const entity = useEntityContext()
    useComponent(entity, EntityTreeComponent)
    const component = useComponent(entity, KHRLightsPunctualComponent)

    const gltfEntity = getAncestorWithComponents(entity, [GLTFComponent])
    const options = getGLTFOptions(gltfEntity)
    const json = options.document
    const extensions: {
      lights?: KHRPunctualLight[]
    } = (json.extensions && json.extensions[KHRLightsPunctualComponent.jsonID]) || {}
    const lightDefs = extensions.lights
    const lightDef = lightDefs && component.light.value !== undefined ? lightDefs[component.light.value] : undefined

    useEffect(() => {
      return () => {
        removeComponent(entity, DirectionalLightComponent)
        removeComponent(entity, SpotLightComponent)
        removeComponent(entity, PointLightComponent)
      }
    }, [lightDef?.type])

    useEffect(() => {
      if (!lightDef) return

      if (lightDef.type !== 'directional') return

      const color = lightDef.color
        ? new Color().setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2])
        : undefined
      const intensity = typeof lightDef.intensity === 'number' ? lightDef.intensity : undefined

      setComponent(entity, DirectionalLightComponent, {
        color,
        intensity
      })
    }, [lightDef])

    useEffect(() => {
      if (!lightDef) return

      if (lightDef.type !== 'spot') return

      const color = lightDef.color
        ? new Color().setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2])
        : undefined

      const intensity = typeof lightDef.intensity === 'number' ? lightDef.intensity : undefined
      const range = typeof lightDef.range === 'number' ? lightDef.range : undefined
      const innerConeAngle = typeof lightDef.spot?.innerConeAngle === 'number' ? lightDef.spot.innerConeAngle : 0
      const outerConeAngle =
        typeof lightDef.spot?.outerConeAngle === 'number' ? lightDef.spot.outerConeAngle : Math.PI / 4.0

      const penumbra = 1.0 - innerConeAngle / outerConeAngle
      const angle = outerConeAngle

      setComponent(entity, SpotLightComponent, {
        color,
        intensity,
        decay: 2,
        range,
        angle,
        penumbra
      })
    }, [lightDef])

    useEffect(() => {
      if (!lightDef) return

      if (lightDef.type !== 'point') return

      const color = lightDef.color
        ? new Color().setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2])
        : undefined
      const intensity = typeof lightDef.intensity === 'number' ? lightDef.intensity : undefined
      const range = typeof lightDef.range === 'number' ? lightDef.range : undefined

      setComponent(entity, PointLightComponent, {
        color,
        intensity,
        decay: 2,
        range
      })
    }, [lightDef])

    return null
  }
})

/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 *
 */
export const EXTMeshGPUInstancingComponent = defineComponent({
  name: 'EXTMeshGPUInstancingComponent',
  jsonID: 'EXT_mesh_gpu_instancing',
  schema: S.Object({
    attributes: S.Record(S.String(), S.Number())
  }),

  loadNode: async (options: GLTFParserOptions, nodeIndex: number) => {
    const pending = [] as Promise<any>[]

    const json = options.document
    const nodeDef = json.nodes![nodeIndex]

    const meshDef = json.meshes![nodeDef.mesh!]

    for (const primitive of meshDef.primitives) {
      if (
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLES &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP &&
        primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN &&
        primitive.mode !== undefined
      ) {
        return null
      }
    }

    const extensionDef = nodeDef.extensions![EXTMeshGPUInstancingComponent.jsonID] as ComponentType<
      typeof EXTMeshGPUInstancingComponent
    >

    const attributesDef = extensionDef.attributes

    const attributes = {} as { [key: string]: BufferAttribute }

    for (const key in attributesDef) {
      pending.push(
        getDependency(options, 'accessor', attributesDef[key]).then((accessor) => {
          attributes[key] = accessor
          return attributes[key]
        })
      )
    }

    if (pending.length < 1) {
      return null
    }

    const results = await Promise.all(pending)

    const nodeID = getNodeID(nodeDef, options.documentID, nodeIndex)
    const nodeUUID = NodeIDComponent.getUUIDBySourceAndNodeID(options.documentID, nodeID)
    const entity = UUIDComponent.getEntityByUUID(nodeUUID)
    const mesh = getComponent(entity, MeshComponent)

    const count = results[0].count // All attribute counts should be same

    // For Working
    const m = new Matrix4()
    const p = new Vector3()
    const q = new Quaternion()
    const s = new Vector3(1, 1, 1)

    const instancedMesh = new InstancedMesh(mesh.geometry.clone(), mesh.material, count)
    for (let i = 0; i < count; i++) {
      if (attributes.TRANSLATION) {
        p.fromBufferAttribute(attributes.TRANSLATION, i)
      }
      if (attributes.ROTATION) {
        q.fromBufferAttribute(attributes.ROTATION, i)
      }
      if (attributes.SCALE) {
        s.fromBufferAttribute(attributes.SCALE, i)
      }
      // @TODO: Support _ID and others
      instancedMesh.setMatrixAt(i, m.compose(p, q, s))
    }

    for (const attributeName in attributes) {
      if (attributeName === '_COLOR_0') {
        const attr = attributes[attributeName]
        instancedMesh.instanceColor = new InstancedBufferAttribute(attr.array, attr.itemSize, attr.normalized)
      } else if (attributeName !== 'TRANSLATION' && attributeName !== 'ROTATION' && attributeName !== 'SCALE') {
        instancedMesh.geometry.setAttribute(attributeName, attributes[attributeName])
      }
    }

    // Just in case
    Mesh.prototype.copy.call(instancedMesh, mesh as any)

    instancedMesh.frustumCulled = false
    instancedMesh.instanceMatrix.needsUpdate = true

    setComponent(entity, MeshComponent, instancedMesh)

    setComponent(entity, InstancingComponent, {
      instanceMatrix: instancedMesh.instanceMatrix
    })
  }
})
