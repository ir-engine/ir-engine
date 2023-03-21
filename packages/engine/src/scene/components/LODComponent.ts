import { useEffect } from 'react'
import { BufferAttribute, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Mesh, Vector3 } from 'three'
import matches from 'ts-matches'

import { NO_PROXY } from '@etherealengine/hyperflux'

import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'

export type LODLevel = {
  distance: number
  model: Mesh | InstancedMesh
}

export const SCENE_COMPONENT_LOD = 'lod'

export const LODComponent = defineComponent({
  name: 'EE_LOD',
  onInit: (entity) => ({
    instanced: false,
    levels: [] as LODLevel[],
    instancePositions: [] as Vector3[],
    instanceLevels: [] as number[]
  }),
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.instanced === 'boolean') component.instanced.set(json.instanced)
    if (
      !!json.levels &&
      matches.arrayOf(matches.shape({ distance: matches.number, model: matches.any })).test(json.levels)
    ) {
      component.levels.set(json.levels)
    }
    if (
      json.instancePositions &&
      matches
        .arrayOf(matches.shape({ x: matches.number, y: matches.number, z: matches.number }))
        .test(json.instancePositions)
    ) {
      component.instancePositions.set([...json.instancePositions])
    }
    if (json.instanceLevels && matches.arrayOf(matches.number).test(json.instanceLevels)) {
      component.instanceLevels.set([...json.instanceLevels])
    }
  },
  reactor: function ({ root }: EntityReactorProps) {
    const entity = root.entity
    const componentState = useComponent(entity, LODComponent)
    const component = componentState.value
    useEffect(() => {
      componentState.levels.forEach((level, index) => {
        const model = level.model.get(NO_PROXY)
        if (component.instanced) {
          const instancedMesh = model as InstancedMesh
          instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage)
          instancedMesh.instanceMatrix.needsUpdate = true
          const lodIndexAttribute = new InstancedBufferAttribute(new Int32Array(component.instanceLevels), 1)
          instancedMesh.geometry.setAttribute('lodIndex', lodIndexAttribute)
          const materials = Array.isArray(instancedMesh.material) ? instancedMesh.material : [instancedMesh.material]
          materials.map((material) => {
            const prevOnBeforeCompile = material.onBeforeCompile
            material.onBeforeCompile = (shader, renderer) => {
              prevOnBeforeCompile(shader, renderer)
              shader.vertexShader = `${shader.vertexShader}
                int lodIndex = ${index};
                uniform int currentLOD;
                
              `
            }
          })
        }
      })
    }, [componentState.levels])
    return null
  }
})
