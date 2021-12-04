/** Functions to provide engine level functionalities. */
import { Color, Object3D } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { disposeDracoLoaderWorkers } from '../../assets/functions/LoadGLTF'
import { isClient } from '../../common/functions/isClient'
import { Network } from '../../networking/classes/Network'
import disposeScene from '../../renderer/functions/disposeScene'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { loadSceneFromJSON } from '../../scene/functions/SceneLoading'
import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { useWorld } from './SystemHooks'
import { hasComponent, removeAllComponents } from './ComponentFunctions'
import { removeEntity } from './EntityFunctions'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'

/** Reset the engine and remove everything from memory. */
export async function reset(): Promise<void> {
  console.log('RESETTING ENGINE')
  // Stop all running workers
  Engine.workers.forEach((w) => w.terminate())
  Engine.workers.length = 0

  disposeDracoLoaderWorkers()

  // clear all entities components
  // await new Promise<void>((resolve) => {
  //   Engine.defaultWorld.entities.forEach((entity) => {
  //     removeAllComponents(entity)
  //   })
  //   setTimeout(() => {
  //     executeSystemBeforeReset() // for systems to handle components deletion
  //     resolve()
  //   }, 500)
  // })

  // await new Promise<void>((resolve) => {
  //   // delete all entities
  //   removeAllEntities()
  //   setTimeout(() => {
  //     executeSystemBeforeReset() // for systems to handle components deletion
  //     resolve()
  //   }, 500)
  // })

  // if (Engine.defaultWorld.entities.length) {
  //   console.log('Engine.defaultWorld.entities.length', Engine.defaultWorld.entities.length)
  //   throw new Error('Engine.defaultWorld.entities cleanup not complete')
  // }

  Engine.defaultWorld.entities.length = 0

  // delete all what is left on scene
  if (Engine.scene) {
    disposeScene(Engine.scene)
    Engine.scene = null!
  }
  Engine.sceneLoaded = false
  Engine.isLoading = false

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

export const unloadScene = async (): Promise<void> => {
  Engine.engineTimer.stop()
  Engine.sceneLoaded = false
  Engine.isLoading = false
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

  const { delta } = Engine.defaultWorld

  Engine.defaultWorld.execute(delta, Engine.defaultWorld.elapsedTime + delta)

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

  isClient && configureEffectComposer(EngineRenderer.instance.postProcessingConfig)

  Engine.defaultWorld.execute(delta, Engine.defaultWorld.elapsedTime + delta)

  Engine.engineTimer.start()

  // world.physics.clear() // TODO:
}
