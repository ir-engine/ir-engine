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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { InstancedBufferAttribute, Matrix4, Mesh, Quaternion, Vector3 } from 'three'

import { useHookstate } from '@hookstate/core'
import { Entity, useQueryBySource, UUIDComponent } from '@ir-engine/ecs'
import { defineComponent, getComponent, useComponent, useEntityContext } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import React, { useEffect, useMemo } from 'react'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import { seededRandom } from 'three/src/math/MathUtils'

const identityMatrix = new Matrix4().identity()
const buffer = new InstancedBufferAttribute(new Float32Array([...identityMatrix.elements]), 16)
const instanceMatrixSchema = S.Type<InstancedBufferAttribute>({ default: () => buffer, serialized: false })

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  jsonID: 'EE_instancing',

  schema: S.Object({
    useMesh: S.Bool({ default: false }),
    count: S.Number({ default: 10 }),
    seed: S.Number(),
    activeMeshEntities: S.Record(S.String(), S.Bool()),
    //internal
    instanceMatrix: S.Type<InstancedBufferAttribute>({ default: () => buffer, serialized: false }),
    // Map of mesh entity to samples
    instanceBuffers: S.Record(S.Number(), instanceMatrixSchema, { serialized: false })
  }),

  reactor: () => {
    const generator = useEntityContext()
    const { useMesh, activeMeshEntities } = useComponent(generator, InstancingComponent)
    const meshEntities = useQueryBySource(generator, [MeshComponent])

    const samplers = useMemo(() => {
      return meshEntities.filter((e) => {
        return !!activeMeshEntities.value[getComponent(e, UUIDComponent).entityID]
      })
    }, [activeMeshEntities, meshEntities])

    if (!useMesh.value) {
      return null
    }

    return (
      <>
        {samplers.map((entity) => (
          <MeshSampler entity={entity} generator={generator} key={`${entity}-${generator}`} />
        ))}
      </>
    )
  }
})

const MeshSampler = ({ entity, generator }: { entity: Entity; generator: Entity }) => {
  const { count, seed, instanceBuffers } = useComponent(generator, InstancingComponent)
  const mesh = useComponent(entity, MeshComponent)

  const sampler = useHookstate(() => {
    const sampler = new MeshSurfaceSampler(mesh.value as Mesh)
    sampler.build()
    return sampler
  })

  useEffect(() => {
    const matrices = [] as number[]
    const position = new Vector3()
    const scale = new Vector3(1, 1, 1)

    for (let i = 0; i < count.value; i++) {
      const rot = new Quaternion().setFromAxisAngle(Vector3_Up, seededRandom(seed.value + i) * Math.PI * 2)

      sampler.value.sample(position)

      const matrix = new Matrix4().compose(position, rot, scale)
      matrices.push(...matrix.elements)
    }

    const buffer = new InstancedBufferAttribute(new Float32Array(matrices), 16)
    instanceBuffers.merge({ [entity]: buffer })

    return () => {
      instanceBuffers.set((data) => {
        delete data[entity]
        return data
      })
    }
  }, [count])

  return null
}
