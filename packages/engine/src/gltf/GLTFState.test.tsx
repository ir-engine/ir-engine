import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { applyIncomingActions, getMutableState } from '@etherealengine/hyperflux'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { GLTF } from '@gltf-transform/core'
import assert from 'assert'
import { Cache, MathUtils } from 'three'
import { GLTFSourceState } from './GLTFState'

describe('GLTFState', () => {
  beforeEach(async () => {
    createEngine()

    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should load a GLTF file with a single node', () => {
    const nodeUUID = MathUtils.generateUUID() as EntityUUID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [UUIDComponent.jsonID!]: nodeUUID
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)

    const timeout = globalThis.setTimeout
    // patch setTimeout to run the callback immediately
    // @ts-ignore
    globalThis.setTimeout = (fn) => fn()

    const gltfEntity = GLTFSourceState.load('/test.gltf')

    globalThis.setTimeout = timeout

    applyIncomingActions()

    console.log(UUIDComponent.getEntityByUUID(nodeUUID))
    assert(UUIDComponent.getEntityByUUID(nodeUUID))

    GLTFSourceState.unload(gltfEntity)

    applyIncomingActions()

    assert(!UUIDComponent.getEntityByUUID(nodeUUID))
  })
})
