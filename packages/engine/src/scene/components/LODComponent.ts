import { useEffect } from 'react'
import { BufferAttribute, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Mesh, Vector3 } from 'three'
import matches from 'ts-matches'

import { NO_PROXY } from '@etherealengine/hyperflux'

import { addOBCPlugin } from '../../common/functions/OnBeforeCompilePlugin'
import { insertAfterString, insertBeforeString } from '../../common/functions/string'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'

export type LODLevel = {
  distance: number
  loaded: boolean
  src: string
  model: Mesh | InstancedMesh | null
}

export type InstancedLODDataType = {
  positions: InstancedBufferAttribute
  levels: InstancedBufferAttribute
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
  reactor: function ({ root }: EntityReactorProps) {
    const entity = root.entity
    const componentState = useComponent(entity, LODComponent)
    const component = componentState.value

    return null
  }
})
