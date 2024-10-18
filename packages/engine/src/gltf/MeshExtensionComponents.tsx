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
  Entity,
  S,
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { NO_PROXY, State, none, useHookstate } from '@ir-engine/hyperflux'
import { DirectionalLightComponent, PointLightComponent, SpotLightComponent } from '@ir-engine/spatial'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import React, { useEffect } from 'react'
import {
  BufferAttribute,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  Vector3
} from 'three'
import { InstancingComponent } from '../scene/components/InstancingComponent'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'
import { getParserOptions } from './GLTFState'

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

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRLightsPunctualComponent)

    const options = getParserOptions(entity)
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

export const EXTMeshGPUInstancingComponent = defineComponent({
  name: 'EXTMeshGPUInstancingComponent',
  jsonID: 'EXT_mesh_gpu_instancing',
  schema: S.Object({
    attributes: S.Record(S.String(), S.Number())
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, EXTMeshGPUInstancingComponent)
    const meshComponent = useOptionalComponent(entity, MeshComponent)

    const attributes = component.attributes.get(NO_PROXY)

    const accessorsState = useHookstate({} as Record<string, BufferAttribute>)

    useEffect(() => {
      if (!meshComponent || !attributes) return
      // ensure all accessors are loaded
      if (Object.keys(attributes).length === 0 || Object.keys(attributes).length !== accessorsState.keys.length) return
      processGPUInstancing(entity, accessorsState.get(NO_PROXY), meshComponent.get(NO_PROXY)! as Mesh)
    }, [accessorsState, !!meshComponent])

    return (
      <>
        {attributes &&
          Object.entries(attributes).map(([attribute, accessorIndex]) => (
            <MeshGPUInstancingAttributeReactor
              key={attribute}
              accessorsState={accessorsState}
              entity={entity}
              attribute={attribute}
              accessorIndex={accessorIndex}
            />
          ))}
      </>
    )
  }
})

const MeshGPUInstancingAttributeReactor = (props: {
  accessorsState: State<Record<string, BufferAttribute>>
  entity: Entity
  attribute: string
  accessorIndex: number
}) => {
  const { accessorsState, entity, accessorIndex } = props
  const options = getParserOptions(entity)
  const accessor = GLTFLoaderFunctions.useLoadAccessor(options, accessorIndex)

  useEffect(() => {
    if (!accessor) return
    accessorsState[props.attribute].set(accessor)
    return () => {
      accessorsState[props.attribute].set(none)
    }
  }, [accessor])

  return null
}

const processGPUInstancing = (entity: Entity, attributes: Record<string, BufferAttribute>, mesh: Mesh) => {
  // get any attribute to get the count
  const attribute0 = Object.values(attributes)[0]
  const count = attribute0.count // All attribute counts should be same

  // For Working
  const m = new Matrix4()
  const p = new Vector3()
  const q = new Quaternion()
  const s = new Vector3(1, 1, 1)

  const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count)
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
      mesh.geometry.setAttribute(attributeName, attributes[attributeName])
    }
  }

  // Just in case
  Object3D.prototype.copy.call(instancedMesh, mesh)

  instancedMesh.frustumCulled = false
  instancedMesh.instanceMatrix.needsUpdate = true

  /** @todo we really should tidy this up, and change it such that the mesh component itself handles adding and removing from group */
  removeObjectFromGroup(entity, mesh)
  removeComponent(entity, MeshComponent)
  setComponent(entity, MeshComponent, instancedMesh)
  addObjectToGroup(entity, instancedMesh)

  setComponent(entity, InstancingComponent, {
    instanceMatrix: instancedMesh.instanceMatrix
  })
}
