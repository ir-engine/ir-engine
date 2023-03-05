/** Functions to provide engine level functionalities. */
import { Object3D } from 'three'

import { dispatchAction } from '@etherealengine/hyperflux'

import { SceneObjectComponent } from '../../scene/components/SceneObjectComponent'
import { Engine } from '../classes/Engine'
import { EngineActions } from '../classes/EngineState'
import { Entity } from '../classes/Entity'
import { World } from '../classes/World'
import { removeEntityNodeRecursively } from '../functions/EntityTree'
import { defineQuery } from './ComponentFunctions'
import { removeEntity } from './EntityFunctions'
import { unloadAllSystems } from './SystemFunctions'

const sceneQuery = defineQuery([SceneObjectComponent])

export const unloadScene = async (world: World) => {
  const entitiesToRemove = [] as Entity[]
  const sceneObjectsToRemove = [] as Object3D[]

  for (const entity of sceneQuery()) entitiesToRemove.push(entity)

  removeEntityNodeRecursively(world.sceneEntity)

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

  await unloadAllSystems(world, true)
  dispatchAction(EngineActions.sceneUnloaded({}))
}
