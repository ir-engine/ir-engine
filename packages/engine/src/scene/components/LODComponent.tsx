import { ReactElement, useEffect } from 'react'
import React from 'react'
import { InstancedBufferAttribute, InstancedMesh, Mesh } from 'three'
import matches from 'ts-matches'

import { createState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent, getComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { isMobileXRHeadset } from '../../xr/XRState'
import { LODPath, processLoadedLODLevel, unloadLODLevel } from '../functions/loaders/LODFunctions'
import getFirstMesh from '../util/getFirstMesh'
import { UUIDComponent } from './UUIDComponent'

export type LODLevel = {
  distance: number
  loaded: boolean
  src: string
  model: Mesh | InstancedMesh | null
  metadata: Record<string, any>
}

export const LODComponent = defineComponent({
  name: 'EE_LOD',

  jsonID: 'lod',

  onInit: (entity) => ({
    target: entity,
    lodPath: '' as LODPath,
    instanced: false,
    levels: [] as LODLevel[],
    lodHeuristic: 'MANUAL' as 'DISTANCE' | 'SCENE_SCALE' | 'MANUAL' | 'DEVICE',
    instanceMatrix: new InstancedBufferAttribute(new Float32Array(), 16),
    instanceLevels: new InstancedBufferAttribute(new Uint8Array(), 1)
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (['number', 'string'].includes(typeof json.target)) {
      const targetEntity = typeof json.target === 'string' ? UUIDComponent.entitiesByUUID[json.target] : json.target
      if (targetEntity && component.target.value !== targetEntity) {
        LODComponent.lodsByEntity[targetEntity].set(
          (
            (LODComponent.lodsByEntity[targetEntity].value ?? []).filter(
              (e) => ![component.target.value, entity].includes(e)
            ) ?? []
          ).concat(entity)
        )
        component.target.set(targetEntity)
      }
    }

    if (typeof json.lodHeuristic === 'string') component.lodHeuristic.set(json.lodHeuristic)
    if (typeof json.lodPath === 'string') component.lodPath.set(json.lodPath)
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
    if (typeof json.instanceMatrix === 'object') {
      if (
        json.instanceMatrix instanceof InstancedBufferAttribute &&
        json.instanceMatrix.array instanceof Float32Array
      ) {
        component.instanceMatrix.set(json.instanceMatrix)
      } else if (json.instanceMatrix instanceof Array && matches.arrayOf(matches.number).test(json.instanceMatrix)) {
        component.instanceMatrix.set(new InstancedBufferAttribute(new Float32Array(json.instanceMatrix), 16))
      }
    }
    if (typeof json.instanceLevels === 'object') {
      if (json.instanceLevels instanceof InstancedBufferAttribute && json.instanceLevels.array instanceof Uint8Array) {
        component.instanceLevels.set(json.instanceLevels)
      } else if (json.instanceLevels instanceof Array && matches.arrayOf(matches.number).test(json.instanceLevels)) {
        component.instanceLevels.set(new InstancedBufferAttribute(new Uint8Array(json.instanceLevels), 1))
      }
    }
  },

  onRemove: (entity, component) => {
    const targetEntity = component.target.value
    if (targetEntity) {
      LODComponent.lodsByEntity[targetEntity].set(
        (LODComponent.lodsByEntity[targetEntity].value ?? []).filter(
          (e) => ![component.target.value, entity].includes(e)
        ) ?? []
      )
    }
  },

  toJSON: (entity, component) => ({
    instanced: component.instanced.value,
    target: getComponent(component.target.value, UUIDComponent),
    levels: component.levels.value.map((level) => {
      return {
        distance: level.distance,
        model: null,
        src: level.src,
        metadata: level.metadata,
        loaded: false
      }
    }),
    lodPath: component.lodPath.value,
    lodHeuristic: component.lodHeuristic.value,
    instanceMatrix: Array.from(component.instanceMatrix.value.array),
    instanceLevels: Array.from(component.instanceLevels.value.array)
  }),

  reactor: LODReactor,

  lodsByEntity: createState({} as Record<Entity, Entity[]>)
})

function LODReactor(): ReactElement {
  const entity = useEntityContext()
  const lodComponent = useComponent(entity, LODComponent)

  useEffect(() => {
    if (lodComponent.lodHeuristic.value === 'DEVICE') {
      const mobileLodIdx = lodComponent.levels.findIndex((level) => level.metadata.value['device'] === 'MOBILE')
      const mobileLod = lodComponent.levels[mobileLodIdx]
      const desktopLodIdx = lodComponent.levels.findIndex((level) => level.metadata.value['device'] === 'DESKTOP')
      const desktopLod = lodComponent.levels[desktopLodIdx]
      const toLoad = isMobileXRHeadset ? mobileLod : desktopLod
      const toLoadIdx = isMobileXRHeadset ? mobileLodIdx : desktopLodIdx
      const toUnload = isMobileXRHeadset ? desktopLod : mobileLod
      new Promise<void>((resolve) => {
        toLoad.loaded.value && resolve()
        AssetLoader.load(toLoad.src.value, {}, (loadedScene: GLTF) => {
          const mesh = getFirstMesh(loadedScene.scene)
          mesh && processLoadedLODLevel(entity, toLoadIdx, mesh)
          toLoad.loaded.set(true)
          resolve()
        })
      }).then(() => {
        toUnload && unloadLODLevel(toUnload)
      })
    }
  }, [lodComponent.lodHeuristic])

  return (
    <>
      {lodComponent.levels.map((level, index) => (
        <LodLevelReactor entity={entity} level={index} key={`${entity}-${index}`} />
      ))}
    </>
  )
}

const LodLevelReactor = React.memo(({ entity, level }: { level: number; entity: Entity }) => {
  const lodComponent = useComponent(entity, LODComponent)

  useEffect(() => {
    const levelModel = lodComponent.levels[level].model.value
  }, [lodComponent.levels[level].model])

  return null
})
