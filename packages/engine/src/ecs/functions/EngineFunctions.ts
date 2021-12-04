/** Functions to provide engine level functionalities. */
import { Color, Object3D } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { disposeDracoLoaderWorkers } from '../../assets/functions/LoadGLTF'
import { isClient } from '../../common/functions/isClient'
import { Network } from '../../networking/classes/Network'
import disposeScene from '../../renderer/functions/disposeScene'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { WorldScene } from '../../scene/functions/SceneLoading'
import { useEngine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { useWorld } from './SystemHooks'
import { hasComponent, removeAllComponents } from './ComponentFunctions'
import { removeEntity } from './EntityFunctions'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'

/** Reset the engine and remove everything from memory. */
export async function reset(): Promise<void> {
  console.log('RESETTING ENGINE')
  // Stop all running workers
  useEngine().workers.forEach((w) => w.terminate())
  useEngine().workers.length = 0

  disposeDracoLoaderWorkers()

  // clear all entities components
  // await new Promise<void>((resolve) => {
  //   useEngine().defaultWorld.entities.forEach((entity) => {
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

  // if (useEngine().defaultWorld.entities.length) {
  //   console.log('useEngine().defaultWorld.entities.length', useEngine().defaultWorld.entities.length)
  //   throw new Error('useEngine().defaultWorld.entities cleanup not complete')
  // }

  useEngine().defaultWorld.entities.length = 0

  // delete all what is left on scene
  if (useEngine().scene) {
    disposeScene(useEngine().scene)
    useEngine().scene = null!
  }
  useEngine().sceneLoaded = false
  WorldScene.isLoading = false

  useEngine().camera = null!

  if (useEngine().renderer) {
    useEngine().renderer.clear(true, true, true)
    useEngine().renderer.dispose()
    useEngine().renderer = null!
  }

  Network.instance.dispose()

  AssetLoader.Cache.clear()

  useEngine().isInitialized = false
  useEngine().inputState.clear()
  useEngine().prevInputState.clear()
}

export const unloadScene = async (): Promise<void> => {
  useEngine().engineTimer.stop()
  useEngine().sceneLoaded = false
  WorldScene.isLoading = false
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

  const { delta } = useEngine().defaultWorld

  useEngine().defaultWorld.execute(delta, useEngine().defaultWorld.elapsedTime + delta)

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

  useEngine().scene.background = new Color('black')
  useEngine().scene.environment = null

  useEngine().scene.traverse((o: any) => {
    if (!o.entity) return
    if (!removedEntities.includes(o.entity)) return

    sceneObjectsToRemove.push(o)
  })

  sceneObjectsToRemove.forEach((o) => useEngine().scene.remove(o))

  entitiesToRemove.forEach((entity) => {
    removeEntity(entity)
  })

  isClient && configureEffectComposer(EngineRenderer.instance.postProcessingConfig)

  useEngine().defaultWorld.execute(delta, useEngine().defaultWorld.elapsedTime + delta)

  useEngine().engineTimer.start()

  // world.physics.clear() // TODO:
}
