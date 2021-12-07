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
  //   Engine.currentWorld.entities.forEach((entity) => {
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

  // if (Engine.currentWorld.entities.length) {
  //   console.log('Engine.currentWorld.entities.length', Engine.currentWorld.entities.length)
  //   throw new Error('Engine.currentWorld.entities cleanup not complete')
  // }

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

  world.entityQuery().forEach((entity) => {
    if (!hasComponent(entity, PersistTagComponent)) {
      removeAllComponents(entity)
      entitiesToRemove.push(entity)
      removedEntities.push(entity)
    }
  })

  const { delta } = Engine.currentWorld

  Engine.currentWorld.execute(delta, Engine.currentWorld.elapsedTime + delta)

  Object.entries(world.pipelines).forEach(([type, pipeline]) => {
    const systemsToRemove: any[] = []
    pipeline.forEach((s) => {
      if (s.sceneSystem) {
        systemsToRemove.push(s)
      }
    })
    systemsToRemove.forEach((s) => {
      const i = pipeline.findIndex(s)
      pipeline.splice(i, 1)
    })
  })

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

  Engine.currentWorld.execute(delta, Engine.currentWorld.elapsedTime + delta)

  Engine.engineTimer.start()

  // world.physics.clear() // TODO:
}
