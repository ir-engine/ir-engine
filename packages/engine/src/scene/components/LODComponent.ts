import { InstancedBufferAttribute, InstancedMesh, Mesh } from 'three'
import matches from 'ts-matches'

import { createState } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export type LODLevel = {
  distance: number
  loaded: boolean
  src: string
  model: Mesh | InstancedMesh | null
}

export type LODComponentType = {
  instanced: boolean
  levels: LODLevel[]
  instancePositions: InstancedBufferAttribute
  instanceLevels: InstancedBufferAttribute
}

export const SCENE_COMPONENT_LOD = 'lod'

export const LODComponent = defineComponent({
  name: 'EE_LOD',
  onInit: (entity) =>
    ({
      instanced: false,
      levels: [] as LODLevel[],
      instancePositions: new InstancedBufferAttribute(new Float32Array(), 3),
      instanceLevels: new InstancedBufferAttribute(new Uint8Array(), 1)
    } as LODComponentType),
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.instanced === 'boolean') component.instanced.set(json.instanced)
    if (
      !!json.levels &&
      matches
        .arrayOf(
          matches.shape({
            distance: matches.number,
            model: matches.any,
            src: matches.string,
            loaded: matches.boolean
          })
        )
        .test(json.levels)
    ) {
      component.levels.set(json.levels)
    }
    if (
      json.instancePositions &&
      json.instancePositions instanceof InstancedBufferAttribute &&
      json.instancePositions.array instanceof Float32Array
    ) {
      component.instancePositions.set(json.instancePositions)
    }
    if (
      typeof json.instanceLevels === 'object' &&
      json.instanceLevels instanceof InstancedBufferAttribute &&
      json.instanceLevels.array instanceof Uint8Array
    ) {
      component.instanceLevels.set(json.instanceLevels)
    }
  },

  lodsByEntity: createState({} as Record<Entity, Entity[]>)
})
