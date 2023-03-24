import { Scene, Vector3 } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getMutableComponent } from '../../ecs/functions/ComponentFunctions'
import { removeObjectFromGroup } from '../components/GroupComponent'
import { LODComponent, SCENE_COMPONENT_LOD } from '../components/LODComponent'
import { processLoadedLODLevel } from '../functions/loaders/LODFunctions'
import getFirstMesh from '../util/getFirstMesh'

export default async function LODSystem() {
  Engine.instance.sceneComponentRegistry.set(LODComponent.name, SCENE_COMPONENT_LOD)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_LOD, {
    defaultData: {}
  })

  const lodQuery = defineQuery([LODComponent])

  const cameraPosition = Engine.instance.camera.position

  const updateFrequency = 0.5

  let lastUpdate = Engine.instance.elapsedSeconds

  function execute() {
    if (Engine.instance.elapsedSeconds - lastUpdate < updateFrequency) return
    lastUpdate = Engine.instance.elapsedSeconds
    for (const entity of lodQuery()) {
      const lodComponent = getMutableComponent(entity, LODComponent)
      //create LOD distances array
      const lodDistances = lodComponent.levels.map((level) => level.distance.value)
      //iterate through all the instance positions and update LOD index based on distance
      const referencedLods = new Set<number>()
      if (lodComponent.instanced.value) {
        const instancePositions = lodComponent.instancePositions.value
        const position = new Vector3()
        for (let i = 0; i < instancePositions.count; i++) {
          position.set(instancePositions.getX(i), instancePositions.getY(i), instancePositions.getZ(i))
          const distance = cameraPosition.distanceTo(position)
          const currentLevel = lodComponent.instanceLevels[i].value
          let newLevel = currentLevel
          for (let j = 0; j < lodDistances.length; j++) {
            if (distance < lodDistances[j] || j === lodDistances.length - 1) {
              ;(currentLevel !== j && (newLevel = j)) || lodComponent.instanceLevels[i].set(j)
              break
            }
          }
          referencedLods.add(newLevel)
        }
      } else {
        //if not instanced, just use the first model position
        const position = lodComponent.levels[0]?.model.value?.position
        if (position) {
          const distance = cameraPosition.distanceTo(position)
          for (let j = 0; j < lodDistances.length; j++) {
            if (distance < lodDistances[j] || j === lodDistances.length - 1) {
              referencedLods.add(j)
              break
            }
          }
        }
      }

      //iterate through all LOD levels and load/unload models based on referencedLods
      for (let i = 0; i < lodComponent.levels.length; i++) {
        const level = lodComponent.levels[i]
        //if the level is referenced, load it if it's not already loaded
        if (referencedLods.has(i)) {
          !level.loaded.value &&
            level.src.value &&
            AssetLoader.load(level.src.value, {}, (loadedScene: Scene) => {
              const mesh = getFirstMesh(loadedScene)
              level.model.set(mesh ?? null)
              processLoadedLODLevel(entity, i)
              level.loaded.set(true)
            })
        } else {
          //if the level is not referenced, unload it if it's loaded
          if (level.loaded.value) {
            const mesh = level.model.value
            level.model.set(null)
            mesh && removeObjectFromGroup(entity, mesh)
            level.loaded.set(false)
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
