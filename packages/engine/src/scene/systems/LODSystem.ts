import { Mesh, Vector3 } from 'three'

import { NO_PROXY, State } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent, getMutableComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { LODComponent, LODComponentType, LODLevel, SCENE_COMPONENT_LOD } from '../components/LODComponent'
import { ModelComponent } from '../components/ModelComponent'
import { objectFromLodPath, processLoadedLODLevel } from '../functions/loaders/LODFunctions'
import getFirstMesh from '../util/getFirstMesh'

export default async function LODSystem() {
  Engine.instance.sceneComponentRegistry.set(LODComponent.name, SCENE_COMPONENT_LOD)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_LOD, {})

  const lodQuery = defineQuery([LODComponent])
  const cameraPosition = Engine.instance.camera.position
  const updateFrequency = 0.5
  let lastUpdate = Engine.instance.elapsedSeconds

  function updateLOD(entity, currentLevel, lodComponent: State<LODComponentType>, lodDistances, position) {
    const heuristic = lodComponent.lodHeuristic.value
    if (heuristic === 'MANUAL' || ['DISTANCE', 'SCENE_SCALE'].includes(heuristic)) {
      const distance = cameraPosition.distanceTo(position)
      for (let j = 0; j < lodDistances.length; j++) {
        if (distance < lodDistances[j] || j === lodDistances.length - 1) {
          const instanceLevels = lodComponent.instanceLevels.get(NO_PROXY)
          if (currentLevel !== j) {
            instanceLevels.setX(entity, j)
            return j
          }
          break
        }
      }
    } else {
      throw Error('Invalid LOD heuristic')
    }
  }

  function execute() {
    if (Engine.instance.elapsedSeconds - lastUpdate < updateFrequency) return
    lastUpdate = Engine.instance.elapsedSeconds
    const referencedLods = new Set<number>()
    const position = new Vector3()
    for (const entity of lodQuery()) {
      const lodComponent = getMutableComponent(entity, LODComponent)
      const modelComponent = getComponent(lodComponent.target.value, ModelComponent)
      if (!modelComponent.scene) continue
      const lodDistances = lodComponent.levels.map((level) => level.distance.value)
      const transform = getComponent(lodComponent.target.value, TransformComponent)

      if (lodComponent.instanced.value) {
        const instancePositions = lodComponent.instanceMatrix.value
        for (let i = 0; i < instancePositions.count; i++) {
          position.fromArray(instancePositions.array, i * 16 + 12)
          position.applyMatrix4(transform.matrix)
          const currentLevel = lodComponent.instanceLevels.get(NO_PROXY).getX(i)
          const newLevel = updateLOD(i, currentLevel, lodComponent, lodDistances, position)
          newLevel !== undefined && referencedLods.add(newLevel)
        }
      } else {
        const currentLevel = lodComponent.instanceLevels.value.array[0]
        position.fromArray(lodComponent.instanceMatrix.value.array, 12)
        position.applyMatrix4(transform.matrix)
        const newLevel = updateLOD(0, currentLevel, lodComponent, lodDistances, position)
        newLevel !== undefined && referencedLods.add(newLevel)
      }
      lodComponent.instanceLevels.get(NO_PROXY).needsUpdate = true
      const levelsToUnload: State<LODLevel>[] = []
      for (let i = 0; i < lodComponent.levels.length; i++) {
        const level = lodComponent.levels[i]
        if (referencedLods.has(i)) {
          if (!level.loaded.value && level.src.value) {
            AssetLoader.load(level.src.value, {}, (loadedScene: GLTF) => {
              const mesh = getFirstMesh(loadedScene.scene)
              mesh && processLoadedLODLevel(entity, i, mesh)
              level.loaded.set(true)
              while (levelsToUnload.length > 0) {
                const levelToUnload = levelsToUnload.pop()
                levelToUnload?.loaded.set(false)
                levelToUnload?.model.get(NO_PROXY)?.removeFromParent()
                levelToUnload?.model.set(null)
              }
            })
          } else if (!level.loaded.value && level.src.value === '') {
            level.model.set(objectFromLodPath(modelComponent, lodComponent.lodPath.value) as Mesh | null)
            level.loaded.set(true)
          }
        } else {
          if (level.loaded.value) {
            levelsToUnload.push(level)
          }
        }
      }
      referencedLods.clear()
    }
  }

  async function cleanup() {
    Engine.instance.sceneComponentRegistry.delete(LODComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_LOD)
  }

  return { execute, cleanup }
}
