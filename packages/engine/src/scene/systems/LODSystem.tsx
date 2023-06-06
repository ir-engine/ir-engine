import { Mesh, Vector3 } from 'three'

import { getState, NO_PROXY, State } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { ComponentType, defineQuery, getComponent, getMutableComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { LODComponent, LODLevel } from '../components/LODComponent'
import { ModelComponent } from '../components/ModelComponent'
import { objectFromLodPath, processLoadedLODLevel, unloadLODLevel } from '../functions/loaders/LODFunctions'
import getFirstMesh from '../util/getFirstMesh'

const lodQuery = defineQuery([LODComponent])
const updateFrequency = 0.1
let lastUpdate = 0

function updateLOD(
  index: number,
  currentLevel: number,
  lodComponent: State<ComponentType<typeof LODComponent>>,
  lodDistances: number[],
  position: Vector3
) {
  const heuristic = lodComponent.lodHeuristic.value
  if (['DISTANCE', 'SCENE_SCALE'].includes(heuristic)) {
    const cameraPosition = Engine.instance.camera.position
    const distance = cameraPosition.distanceToSquared(position)
    for (let j = 0; j < lodDistances.length; j++) {
      if (distance < Math.pow(lodDistances[j], 2) || j === lodDistances.length - 1) {
        const instanceLevels = lodComponent.instanceLevels.get(NO_PROXY)
        if (currentLevel !== j) {
          instanceLevels.setX(index, j)
        }
        return j
      }
    }
  } else if (heuristic === 'MANUAL') {
    return 0
    //todo: implement manual LOD setting
  } else {
    throw Error('Invalid LOD heuristic')
  }
}

function execute() {
  const engineState = getState(EngineState)
  if (engineState.elapsedSeconds - lastUpdate < updateFrequency) return
  lastUpdate = engineState.elapsedSeconds

  const referencedLods = new Set<number>()
  const position = new Vector3()

  for (const entity of lodQuery()) {
    const lodComponent = getMutableComponent(entity, LODComponent)
    if (lodComponent.lodHeuristic.value === 'DISTANCE') {
      const modelComponent = getComponent(lodComponent.target.value, ModelComponent)
      if (!modelComponent.scene) continue
      const lodDistances = lodComponent.levels.map((level) => level.distance.value)
      const transform = getComponent(lodComponent.target.value, TransformComponent)
      let levelsChanged = false
      if (lodComponent.instanced.value) {
        /*const instancePositions = lodComponent.instanceMatrix.value
        const instanceLevels = lodComponent.instanceLevels.value.array
        for (let i = 0; i < instancePositions.count; i++) {
          position.fromArray(instancePositions.array, i * 16 + 12)
          position.applyMatrix4(transform.matrix)
          const currentLevel = instanceLevels[i]
          const newLevel = updateLOD(i, currentLevel, lodComponent, lodDistances, position)
          newLevel !== undefined && referencedLods.add(newLevel)
          newLevel !== currentLevel && (levelsChanged = true)
        }*/
        lodComponent.levels.forEach((level, i) => {
          referencedLods.add(i)
        })
      } else {
        const currentLevel = lodComponent.instanceLevels.value.array[0]
        position.fromArray(lodComponent.instanceMatrix.value.array, 12)
        position.applyMatrix4(transform.matrix)
        const newLevel = updateLOD(0, currentLevel, lodComponent, lodDistances, position)
        newLevel !== undefined && referencedLods.add(newLevel)
        newLevel !== currentLevel && (levelsChanged = true)
      }
      levelsChanged && (lodComponent.instanceLevels.get(NO_PROXY).needsUpdate = true)
      const levelsToUnload: State<LODLevel>[] = []
      const levelsToLoad: [number, State<LODLevel>][] = []
      for (let i = 0; i < lodComponent.levels.length; i++) {
        const level = lodComponent.levels[i]
        if (referencedLods.has(i)) {
          levelsToLoad.push([i, level])
        } else {
          if (/*!lodComponent.instanced.value && */ level.loaded.value) {
            levelsToUnload.push(level)
          }
        }
      }
      const loadPromises: Promise<void>[] = []

      while (levelsToLoad.length > 0) {
        const [i, level] = levelsToLoad.pop()!
        if (!level.loaded.value) {
          if (level.src.value) {
            loadPromises.push(
              new Promise((resolve) => {
                AssetLoader.load(level.src.value, {}, (loadedScene: GLTF) => {
                  const mesh = getFirstMesh(loadedScene.scene)
                  mesh && processLoadedLODLevel(entity, i, mesh)
                  resolve()
                })
              })
            )
          } else {
            processLoadedLODLevel(entity, i, objectFromLodPath(modelComponent, lodComponent.lodPath.value) as Mesh)
          }
          level.loaded.set(true)
        }
      }

      Promise.all(loadPromises).then(() => {
        while (levelsToUnload.length > 0) {
          const levelToUnload = levelsToUnload.pop()
          levelToUnload && unloadLODLevel(levelToUnload)
        }
      })
      referencedLods.clear()
    }
  }
}

export const LODSystem = defineSystem({
  uuid: 'ee.engine.scene.LODSystem',
  execute
})
