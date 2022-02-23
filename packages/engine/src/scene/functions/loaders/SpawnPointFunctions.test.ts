import { ComponentJson } from '@xrengine/engine/src/common/types/SceneInterface'
import assert from 'assert'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { SpawnPointComponent } from '../../components/SpawnPointComponent'
import { deserializeSpawnPoint } from './SpawnPointFunctions'

describe('SpawnPointFunctions', () => {
  it('deserializeSpawnPoint', () => {
    const world = createWorld()
    Engine.currentWorld = world
    const entity = createEntity()

    const sceneComponentData = {}
    const sceneComponent: ComponentJson = {
      name: 'spawn-point',
      props: sceneComponentData
    }

    deserializeSpawnPoint(entity, sceneComponent)

    assert(hasComponent(entity, SpawnPointComponent))
  })
})
