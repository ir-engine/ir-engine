import assert from 'assert'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { SpawnPointComponent } from '../../components/SpawnPointComponent'
import { deserializeSpawnPoint, SCENE_COMPONENT_SPAWN_POINT, serializeSpawnPoint } from './SpawnPointFunctions'

describe('SpawnPointFunctions', () => {
  beforeEach(() => {
    createEngine()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_SPAWN_POINT,
    props: sceneComponentData
  }

  describe('deserializeSpawnPoint()', () => {
    it('creates SpawnPoint Component with provided component data', () => {
      const entity = createEntity()
      deserializeSpawnPoint(entity, sceneComponent)

      const spawnpointComponent = getComponent(entity, SpawnPointComponent)
      assert(spawnpointComponent)
      assert(Object.keys(spawnpointComponent).length === 0)
    })
  })

  describe('serializeSpawnPoint()', () => {
    it('should properly serialize spawnpoint', () => {
      const entity = createEntity()
      deserializeSpawnPoint(entity, sceneComponent)
      assert.deepEqual(serializeSpawnPoint(entity), sceneComponent)
    })

    it('should return undefine if there is no spawnpoint component', () => {
      const entity = createEntity()
      assert(serializeSpawnPoint(entity) === undefined)
    })
  })
})
