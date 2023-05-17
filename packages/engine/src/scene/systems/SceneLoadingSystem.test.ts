import assert from 'assert'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneData, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { getMutableState } from '@etherealengine/hyperflux'

import { destroyEngine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { createEngine } from '../../initializeEngine'
import { NameComponent } from '../components/NameComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { updateSceneFromJSON } from './SceneLoadingSystem'

const sceneJSON_1 = {
  scene: {
    entities: {
      root: {
        name: 'Root',
        components: []
      }
    },
    root: 'root' as EntityUUID,
    version: 0
  } as SceneJson
} as SceneData

const sceneJSON_2 = {
  scene: {
    entities: {
      root: {
        name: 'Root',
        components: []
      },
      child_0: {
        name: 'Child 0',
        components: [],
        parent: 'root'
      }
    },
    root: 'root' as EntityUUID,
    version: 0
  } as SceneJson
} as SceneData

describe('SceneLoadingSystem', () => {
  beforeEach(() => {
    createEngine()
  })

  describe('updateSceneFromJSON', () => {
    it('will load root entity', async () => {
      /** Load First Test Scene */
      const sceneState = getMutableState(SceneState)
      sceneState.sceneData.set(sceneJSON_1)

      await updateSceneFromJSON()

      const rootEntity = UUIDComponent.entitiesByUUID['root']
      assert(rootEntity)
      assert(hasComponent(rootEntity, EntityTreeComponent))
      assert(EntityTreeComponent.roots[rootEntity])
      assert.equal(getComponent(rootEntity, EntityTreeComponent).parentEntity, null)
      assert.equal(getComponent(rootEntity, NameComponent), 'Root')
    })

    it('will load child entity', async () => {
      const sceneState = getMutableState(SceneState)
      sceneState.sceneData.set(sceneJSON_1)

      await updateSceneFromJSON()

      sceneState.sceneData.set(sceneJSON_2)
      await updateSceneFromJSON()

      const rootEntity = UUIDComponent.entitiesByUUID['root']
      const childEntity = UUIDComponent.entitiesByUUID['child_0']
      assert(childEntity)
      assert(hasComponent(childEntity, EntityTreeComponent))
      assert.equal(getComponent(childEntity, EntityTreeComponent).parentEntity, rootEntity)
      assert.equal(getComponent(childEntity, NameComponent), 'Child 0')
    })

    it('will unload child entity', async () => {
      const sceneState = getMutableState(SceneState)
      sceneState.sceneData.set(sceneJSON_2)

      await updateSceneFromJSON()

      sceneState.sceneData.set(sceneJSON_1)
      await updateSceneFromJSON()

      const rootEntity = UUIDComponent.entitiesByUUID['root']
      const childEntity = UUIDComponent.entitiesByUUID['child_0']
      assert(rootEntity)
      assert.equal(childEntity, undefined)
    })
  })

  afterEach(() => {
    return destroyEngine()
  })
})
