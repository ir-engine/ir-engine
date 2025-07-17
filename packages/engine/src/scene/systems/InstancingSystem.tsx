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

import {
  defineSystem,
  Entity,
  EntityTreeComponent,
  EntityUUIDPair,
  getComponent,
  PresentationSystemGroup,
  removeComponent,
  setComponent,
  useComponent,
  useQuery,
  useQueryBySource,
  UUIDComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { stringHash } from '@ir-engine/spatial/src/common/functions/MathFunctions'
import { addOBCPlugin, removeOBCPlugin } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import React, { useCallback, useEffect } from 'react'
import { InstancedBufferAttribute, InstancedMesh, Material, Matrix4 } from 'three'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { Heuristic, VariantComponent } from '../components/VariantComponent'
import { useEntity } from '../functions/useEntity'

export const InstancingSystem = defineSystem({
  uuid: 'ee.engine.InstancingSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const entities = useQuery([InstancingComponent, VariantComponent])
    return (
      <>
        {entities.map((entity) => (
          <VariantGenerator entity={entity} key={entity} />
        ))}
      </>
    )
  }
})

export const VariantGenerator = ({ entity }) => {
  const component = useComponent(entity, VariantComponent).value

  return (
    <>
      {component.levels.map((level, index) => (
        <InstanceGenerator generator={entity} index={index} key={stringHash(`${entity}-${index}-${level.src}`)} />
      ))}
    </>
  )
}

interface InstanceGeneratorProps {
  generator: Entity
  index: number
}

export const InstanceGenerator = ({ generator, index }: InstanceGeneratorProps) => {
  const { src } = useComponent(generator, VariantComponent).levels[index].value

  const setup = (entity: Entity) => {
    const entitySourceID = getComponent(generator, UUIDComponent).entitySourceID
    const entityID = UUIDComponent.generate()
    setComponent(entity, UUIDComponent, {
      entitySourceID,
      entityID
    } as EntityUUIDPair)
    setComponent(entity, NameComponent, getComponent(generator, NameComponent) + ' LOD ' + index)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity: generator })
    setComponent(entity, VisibleComponent)
    setComponent(entity, GLTFComponent, { src })
  }

  const gltfEntity = useEntity({ setup })
  const instanceMeshEntities = useQueryBySource(gltfEntity, [MeshComponent])

  return (
    <>
      {instanceMeshEntities.map((entity) => (
        <InstancedMeshReactor meshEntity={entity} generator={generator} key={`${entity}-${index}`} levelIndex={index} />
      ))}
    </>
  )
}

interface InstancedMeshReactorProps {
  meshEntity: Entity
  generator: Entity
  levelIndex: number
}

const InstancedMeshReactor = ({ meshEntity, generator, levelIndex }: InstancedMeshReactorProps) => {
  const { instanceBuffers } = useComponent(generator, InstancingComponent)
  const mesh = useComponent(meshEntity, MeshComponent)
  const { heuristic } = useComponent(generator, VariantComponent)

  const generateInstancedMesh = useCallback(() => {
    let instanceMatrix = new InstancedBufferAttribute(new Float32Array([...new Matrix4().identity().elements]), 16)
    const buffers = Object.values(instanceBuffers.value) as InstancedBufferAttribute[]

    if (buffers.length > 0) {
      const totalLength = buffers.reduce((sum, buffer) => sum + buffer.array.length, 0)
      const concatenatedArray = new Float32Array(totalLength)

      let offset = 0
      for (const buffer of buffers) {
        concatenatedArray.set(buffer.array, offset)
        offset += buffer.array.length
      }

      instanceMatrix = new InstancedBufferAttribute(concatenatedArray, 16)
    }

    const instancedMesh = new InstancedMesh(
      mesh.geometry.value.clone(),
      mesh.value.material as Material,
      instanceMatrix.count
    )
    instancedMesh.instanceMatrix.copy(instanceMatrix as any)
    instancedMesh.frustumCulled = false

    setComponent(meshEntity, MeshComponent, instancedMesh)

    return instancedMesh
  }, [instanceBuffers])

  useEffect(() => {
    generateInstancedMesh()
  }, [instanceBuffers])

  switch (heuristic.value) {
    case Heuristic.DISTANCE:
      return <DistanceReactor entity={meshEntity} generator={generator} index={levelIndex} key={meshEntity} />
    default:
      return null
  }
}

const DistanceReactor = ({ entity, generator, index }) => {
  const mesh = useComponent(entity, MeshComponent).value as InstancedMesh
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  const { minDistance, maxDistance } = useComponent(generator, VariantComponent).levels[index].metadata.value as {
    minDistance: number
    maxDistance: number
  }

  useEffect(() => {
    const compileMaterial = (material: Material) => (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        'uniform float opacity;',
        `uniform float opacity;
uniform float maxDistance;
uniform float minDistance;`
      )

      // Calculate the camera distance from the geometry
      // Discard fragments outside the minDistance and maxDistance range
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `void main() {
float cameraDistance = length(vViewPosition);
if (cameraDistance <= minDistance || cameraDistance >= maxDistance) {
discard;
}`
      )
      shader.uniforms.minDistance = { value: minDistance }
      shader.uniforms.maxDistance = { value: maxDistance }
      material.shader = shader
    }

    for (const material of materials) {
      addOBCPlugin(material, {
        id: 'lod-culling',
        priority: 1,
        compile: compileMaterial(material)
      })
    }

    setComponent(generator, DistanceFromCameraComponent)
    VariantComponent.setDistanceLevel(generator)

    return () => {
      for (const material of materials) {
        removeOBCPlugin(material, {
          id: 'lod-culling',
          priority: 1,
          compile: compileMaterial(material)
        })
      }
      removeComponent(generator, DistanceFromCameraComponent)
    }
  }, [])

  useEffect(() => {
    for (const material of materials) {
      if (!material.shader?.uniforms?.minDistance) continue
      material.shader.uniforms.minDistance.value = minDistance
      material.shader.uniforms.maxDistance.value = maxDistance
      material.needsUpdate = true
    }
  }, [minDistance, maxDistance])

  return null
}
