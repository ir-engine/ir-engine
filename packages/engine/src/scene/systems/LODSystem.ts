import { InstancedMesh } from 'three'

import { NO_PROXY } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getMutableComponent } from '../../ecs/functions/ComponentFunctions'
import { LODComponent, SCENE_COMPONENT_LOD } from '../components/LODComponent'

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

      for (let i = 0; i < lodComponent.instancePositions.length; i++) {
        const position = lodComponent.instancePositions[i].value
        const distance = cameraPosition.distanceTo(position)
        const currentLevel = lodComponent.instanceLevels[i].value
        for (let j = 0; j < lodDistances.length; j++) {
          if (distance < lodDistances[j] || j === lodDistances.length - 1) {
            if (currentLevel !== j) {
              lodComponent.instanceLevels[i].set(j)
            }
            break
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
