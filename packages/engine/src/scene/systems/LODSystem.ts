import { Mesh, Scene, Vector3 } from 'three'

import { NO_PROXY, State } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent, getMutableComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { LODComponent, LODLevel, SCENE_COMPONENT_LOD } from '../components/LODComponent'
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

  function execute() {
    if (Engine.instance.elapsedSeconds - lastUpdate < updateFrequency) return
    lastUpdate = Engine.instance.elapsedSeconds
    for (const entity of lodQuery()) {
      const lodComponent = getMutableComponent(entity, LODComponent)
      const modelComponent = getComponent(lodComponent.target.value, ModelComponent)
      //if the model is not loaded, skip
      if (!modelComponent.scene) continue
      //create LOD distances array
      const lodDistances = lodComponent.levels.map((level) => level.distance.value)
      //iterate through all the instance positions and update LOD index based on distance
      const referencedLods = new Set<number>()
      if (lodComponent.instanced.value) {
        const heuristic = lodComponent.lodHeuristic.value
        if (heuristic === 'MANUAL') {
          referencedLods.add(lodComponent.instanceLevels.get(NO_PROXY).getX(0))
        } else if (['DISTANCE', 'SCENE_SCALE'].includes(heuristic)) {
          const instancePositions = lodComponent.instanceMatrix.value
          const position = new Vector3()
          for (let i = 0; i < instancePositions.count; i++) {
            position.set(
              instancePositions.array[i * 16 + 12],
              instancePositions.array[i * 16 + 13],
              instancePositions.array[i * 16 + 14]
            )
            const distance = cameraPosition.distanceTo(position)
            const levelsAttr = lodComponent.instanceLevels.get(NO_PROXY)
            const currentLevel = levelsAttr.getX(i)
            let newLevel = currentLevel
            for (let j = 0; j < lodDistances.length; j++) {
              if (distance < lodDistances[j] || j === lodDistances.length - 1) {
                ;(currentLevel !== j && (newLevel = j)) || levelsAttr.setX(i, j)
                break
              }
            }
            referencedLods.add(newLevel)
          }
        } else throw Error('Invalid LOD heuristic')
      } else {
        //if not instanced, just use the first model position
        const currentLevel = lodComponent.instanceLevels.value.array[0]
        if (lodComponent.lodHeuristic.value === 'MANUAL') {
          referencedLods.add(currentLevel)
        } else if (['DISTANCE', 'SCENE_SCALE'].includes(lodComponent.lodHeuristic.value)) {
          const instanceMatrixElts = lodComponent.instanceMatrix.value.array
          const position = new Vector3(instanceMatrixElts[12], instanceMatrixElts[13], instanceMatrixElts[14])
          if (position) {
            const transform = getComponent(lodComponent.target.value, TransformComponent)
            position.applyMatrix4(transform.matrix)
            const distance = cameraPosition.distanceTo(position)
            for (let j = 0; j < lodDistances.length; j++) {
              if (distance < lodDistances[j] || j === lodDistances.length - 1) {
                referencedLods.add(j)
                lodComponent.instanceLevels.get(NO_PROXY).setX(0, j)
                break
              }
            }
          }
        } else throw Error('Invalid LOD heuristic')
      }
      const levelsToUnload: State<LODLevel>[] = []
      //iterate through all LOD levels and load/unload models based on referencedLods
      for (let i = 0; i < lodComponent.levels.length; i++) {
        const level = lodComponent.levels[i]
        //if the level is referenced, load it if it's not already loaded
        if (referencedLods.has(i)) {
          !level.loaded.value &&
            level.src.value &&
            AssetLoader.load(level.src.value, {}, (loadedScene: GLTF) => {
              const mesh = getFirstMesh(loadedScene.scene)
              mesh && processLoadedLODLevel(entity, i, mesh)
              level.model.set(mesh ?? null)
              level.loaded.set(true)
              while (levelsToUnload.length > 0) {
                const levelToUnload = levelsToUnload.pop()!
                levelToUnload.loaded.set(false)
                levelToUnload.model.get(NO_PROXY)?.removeFromParent()
                levelToUnload.model.set(null)
              }
            })
          // if level has blank src, use the mesh at lodPath in the target model
          ;(!level.loaded.value &&
            level.src.value === '' &&
            level.model.set(objectFromLodPath(modelComponent, lodComponent.lodPath.value)! as Mesh)) ||
            level.loaded.set(true)
        } else {
          //if the level is not referenced, unload it if it's loaded
          if (level.loaded.value) {
            levelsToUnload.push(level)
          }
        }
      }
    }
  }

  async function cleanup() {
    Engine.instance.sceneComponentRegistry.delete(LODComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_LOD)
  }

  return { execute, cleanup }
}
