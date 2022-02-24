/** Functions to provide engine level functionalities. */
import { Color, Object3D } from 'three'

import { AssetLoader, disposeDracoLoaderWorkers } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import disposeScene from '../../renderer/functions/disposeScene'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { Engine } from '../classes/Engine'
import { EngineActions } from '../classes/EngineService'
import { Entity } from '../classes/Entity'
import { EntityTreeNode } from '../classes/EntityTree'
import { World } from '../classes/World'
import { hasComponent } from './ComponentFunctions'
import { removeEntity } from './EntityFunctions'

/** Reset the engine and remove everything from memory. */
export function reset() {
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

  Engine.camera = null!

  if (Engine.renderer) {
    Engine.renderer.clear(true, true, true)
    Engine.renderer.dispose()
    Engine.renderer = null!
  }

  AssetLoader.Cache.clear()

  Engine.isInitialized = false
  Engine.inputState.clear()
  Engine.prevInputState.clear()
}

export const unloadScene = async (world: World, removePersisted = false) => {
  await Promise.all(Engine.sceneLoadPromises)
  unloadAllEntities(world, removePersisted)

  Engine.sceneLoaded = false
  dispatchLocal(EngineActions.sceneUnloaded())

  Engine.scene.background = new Color('black')
  Engine.scene.environment = null

  isClient && configureEffectComposer()

  for (const world of Engine.worlds) {
    world.execute(50, world.elapsedTime)
  }
}

export const unloadAllEntities = (world: World, removePersisted = false) => {
  const entitiesToRemove = [] as Entity[]
  const entityNodesToRemove = [] as EntityTreeNode[]
  const sceneObjectsToRemove = [] as Object3D[]

  world.entityQuery().forEach((entity) => {
    if (removePersisted || !hasComponent(entity, PersistTagComponent)) entitiesToRemove.push(entity)
  })

  if (removePersisted) {
    world.entityTree.empty()
  } else {
    world.entityTree.traverse((node) => {
      if (hasComponent(node.entity, PersistTagComponent)) {
        node.traverseParent((parent) => {
          let index = entitiesToRemove.indexOf(parent.entity)
          if (index > -1) entitiesToRemove.splice(index, 1)

          index = entityNodesToRemove.indexOf(parent)
          if (index > -1) entityNodesToRemove.splice(index, 1)
        })
      } else {
        entityNodesToRemove.push(node)
      }
    })

    entityNodesToRemove.forEach((node) => node.removeFromParent())
  }

  Engine.scene.traverse((o: any) => {
    if (!o.entity) return
    if (!entitiesToRemove.includes(o.entity)) return

    if (o.geometry) {
      o.geometry.dispose()
    }

    if (o.material) {
      if (o.material.length) {
        for (let i = 0; i < o.material.length; ++i) {
          o.material[i].dispose()
        }
      } else {
        o.material.dispose()
      }
    }

    sceneObjectsToRemove.push(o)
  })

  world.namedEntities.clear()

  sceneObjectsToRemove.forEach((o) => Engine.scene.remove(o))
  entitiesToRemove.forEach((entity) => removeEntity(entity, true))
}
