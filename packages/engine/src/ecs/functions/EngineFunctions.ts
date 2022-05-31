/** Functions to provide engine level functionalities. */
import { Color, Object3D } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { AssetLoader, disposeDracoLoaderWorkers } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { removeClientInputListeners } from '../../input/functions/clientInputListeners'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import disposeScene from '../../renderer/functions/disposeScene'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { Engine } from '../classes/Engine'
import { EngineActions } from '../classes/EngineState'
import { Entity } from '../classes/Entity'
import { EntityTreeNode } from '../classes/EntityTree'
import { World } from '../classes/World'
import { hasComponent } from './ComponentFunctions'
import { removeEntity } from './EntityFunctions'
import {
  emptyEntityTree,
  removeEntityNodeFromParent,
  traverseEntityNode,
  traverseEntityNodeParent
} from './EntityTreeFunctions'
import { unloadSystems } from './SystemFunctions'

export const shutdownEngine = async () => {
  removeClientInputListeners()

  Engine.instance.engineTimer?.clear()
  Engine.instance.engineTimer = null!

  reset()
}

/** Reset the engine and remove everything from memory. */
export function reset() {
  console.log('RESETTING ENGINE')
  dispatchAction(EngineActions.sceneUnloaded())

  disposeDracoLoaderWorkers()

  // clear all entities components
  // await new Promise<void>((resolve) => {
  //   Engine.instance.currentWorld.entities.forEach((entity) => {
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

  // if (Engine.instance.currentWorld.entities.length) {
  //   console.log('Engine.instance.currentWorld.entities.length', Engine.instance.currentWorld.entities.length)
  //   throw new Error('Engine.instance.currentWorld.entities cleanup not complete')
  // }

  // delete all what is left on scene
  if (Engine.instance.currentWorld.scene) {
    disposeScene(Engine.instance.currentWorld.scene)
    Engine.instance.currentWorld.scene = null!
  }

  Engine.instance.currentWorld.camera = null!

  if (EngineRenderer.instance.renderer) {
    EngineRenderer.instance.renderer.clear(true, true, true)
    EngineRenderer.instance.renderer.dispose()
    EngineRenderer.instance.renderer = null!
  }

  AssetLoader.Cache.clear()

  dispatchAction(EngineActions.initializeEngine({ initialised: false }))
  Engine.instance.currentWorld.inputState.clear()
  Engine.instance.currentWorld.prevInputState.clear()
}

export const unloadScene = (world: World, removePersisted = false) => {
  unloadAllEntities(world, removePersisted)
  unloadSystems(world, true)

  dispatchAction(EngineActions.sceneUnloaded())

  Engine.instance.currentWorld.scene.background = new Color('black')
  Engine.instance.currentWorld.scene.environment = null

  EngineRenderer.instance.resetScene()

  isClient && configureEffectComposer()

  for (const world of Engine.instance.worlds) {
    world.execute(50)
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
    emptyEntityTree(world.entityTree)
  } else {
    traverseEntityNode(world.entityTree.rootNode, (node) => {
      if (hasComponent(node.entity, PersistTagComponent)) {
        traverseEntityNodeParent(node, (parent) => {
          let index = entitiesToRemove.indexOf(parent.entity)
          if (index > -1) entitiesToRemove.splice(index, 1)

          index = entityNodesToRemove.indexOf(parent)
          if (index > -1) entityNodesToRemove.splice(index, 1)
        })
      } else {
        entityNodesToRemove.push(node)
      }
    })

    entityNodesToRemove.forEach((node) => removeEntityNodeFromParent(node, world.entityTree))
  }

  Engine.instance.currentWorld.scene.traverse((o: any) => {
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

  sceneObjectsToRemove.forEach((o) => Engine.instance.currentWorld.scene.remove(o))
  entitiesToRemove.forEach((entity) => removeEntity(entity, true))
}
