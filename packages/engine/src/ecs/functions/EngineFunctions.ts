/** Functions to provide engine level functionalities. */
import { Object3D } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { disposeDracoLoaderWorkers } from '../../assets/classes/AssetLoader'
import { removeClientInputListeners } from '../../input/functions/clientInputListeners'
import disposeScene from '../../renderer/functions/disposeScene'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { SceneObjectComponent } from '../../scene/components/SceneObjectComponent'
import { Engine } from '../classes/Engine'
import { EngineActions } from '../classes/EngineState'
import { Entity } from '../classes/Entity'
import { World } from '../classes/World'
import { EntityTreeNode, removeEntityNodeFromParent, traverseEntityNode } from '../functions/EntityTree'
import { defineQuery } from './ComponentFunctions'
import { removeEntity } from './EntityFunctions'
import { unloadSystems } from './SystemFunctions'

/** Reset the engine and remove everything from memory. */
export function dispose() {
  removeClientInputListeners()

  Engine.instance.engineTimer?.clear()
  Engine.instance.engineTimer = null!
  console.log('RESETTING ENGINE')
  dispatchAction(EngineActions.sceneUnloaded({}))

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

  if (EngineRenderer.instance.renderer) {
    EngineRenderer.instance.renderer.clear(true, true, true)
    EngineRenderer.instance.renderer.dispose()
    EngineRenderer.instance.renderer = null!
  }

  dispatchAction(EngineActions.initializeEngine({ initialised: false }))
  Engine.instance.currentWorld.inputState.clear()
  Engine.instance.currentWorld.prevInputState.clear()
}

const sceneQuery = defineQuery([SceneObjectComponent])

export const unloadScene = (world: World) => {
  const entitiesToRemove = [] as Entity[]
  const entityNodesToRemove = [] as EntityTreeNode[]
  const sceneObjectsToRemove = [] as Object3D[]

  for (const entity of sceneQuery()) entitiesToRemove.push(entity)

  traverseEntityNode(world.entityTree.rootNode, (node) => {
    entityNodesToRemove.push(node)
  })

  entityNodesToRemove.forEach((node) => removeEntityNodeFromParent(node, world.entityTree))

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

  for (const o of sceneObjectsToRemove) Engine.instance.currentWorld.scene.remove(o)
  for (const entity of entitiesToRemove) removeEntity(entity, true)

  unloadSystems(world, true)
  EngineRenderer.instance.resetScene()
  dispatchAction(EngineActions.sceneUnloaded({}))
}
