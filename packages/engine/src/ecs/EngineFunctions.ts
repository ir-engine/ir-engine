/** Functions to provide engine level functionalities. */
import { Color, Object3D } from 'three'
import { AssetLoader } from '../assets/AssetLoader'
import { disposeDracoLoaderWorkers } from '../assets/LoadGLTF'
import { isClient } from '../common/functions/isClient'
import { Network } from '../networking/classes/Network'
import disposeScene from '../renderer/functions/disposeScene'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { PersistTagComponent } from '../scene/components/PersistTagComponent'
import { WorldScene } from '../scene/functions/SceneLoading'
import { Engine } from './Engine'
import { Entity } from './Entity'
import { useWorld } from './SystemHooks'
import { hasComponent, removeAllComponents } from './ComponentFunctions'
import { removeEntity } from './EntityFunctions'

/**
* Reset the engine.
* Stop all running workers.
* Dispose Draco loader workers.
* Delete all entities on the scene.
* Delete the scene.
* Reset the camera.
* Reset the renderer.
* Dispose the renderer.
* Clear the network.
* Clear the asset loader cache.
* Reset the engine.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/ export async function reset(): Promise<void> {
  console.log('RESETTING ENGINE')
  // Stop all running workers
  Engine.workers.forEach((w) => w.terminate())
  Engine.workers.length = 0

  disposeDracoLoaderWorkers()

  Engine.tick = 0

  Engine.defaultWorld.entities.length = 0

  // delete all what is left on scene
  if (Engine.scene) {
    disposeScene(Engine.scene)
    Engine.scene = null!
  }
  Engine.sceneLoaded = false
  WorldScene.isLoading = false

  Engine.camera = null!

  if (Engine.renderer) {
    Engine.renderer.clear(true, true, true)
    Engine.renderer.dispose()
    Engine.renderer = null!
  }

  Network.instance.dispose()

  AssetLoader.Cache.clear()

  Engine.isInitialized = false
  Engine.inputState.clear()
  Engine.prevInputState.clear()
}

/**
* Process a location change.
* Remove entities and scene objects that are no longer in the world.
* @param {Promise} [callback] - Callback function.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
export const processLocationChange = async (): Promise<void> => {
  const world = useWorld()
  const entitiesToRemove = [] as Entity[]
  const removedEntities = [] as Entity[]
  const sceneObjectsToRemove = [] as Object3D[]

  world.entities.forEach((entity) => {
    if (!hasComponent(entity, PersistTagComponent)) {
      removeAllComponents(entity)
      entitiesToRemove.push(entity)
      removedEntities.push(entity)
    }
  })

  Engine.defaultWorld.execute(1 / 60, Engine.defaultWorld.elapsedTime + 1 / 60)

  Engine.scene.background = new Color('black')
  Engine.scene.environment = null

  Engine.scene.traverse((o: any) => {
    if (!o.entity) return
    if (!removedEntities.includes(o.entity)) return

    sceneObjectsToRemove.push(o)
  })

  sceneObjectsToRemove.forEach((o) => Engine.scene.remove(o))

  entitiesToRemove.forEach((entity) => {
    removeEntity(entity)
  })

  isClient && EngineRenderer.instance.resetPostProcessing()

  Engine.defaultWorld.execute(1 / 60, Engine.defaultWorld.elapsedTime + 1 / 60)
  world.physics.dispose()
}
