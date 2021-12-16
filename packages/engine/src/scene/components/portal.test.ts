import assert from 'assert'
import sceneJson from '@xrengine/projects/default-project/empty.scene.json'
import { parseSceneDataCacheURLs } from '@xrengine/server-core/src/world/scene/scene-parser'
import appRootPath from 'app-root-path'
import dotenv from 'dotenv-flow'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { initializeEngine } from '../../initializeEngine'
import { engineTestSetup } from '../../../tests/util/setupEngine'
import { loadSceneFromJSON } from '../functions/SceneLoading'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { unloadScene } from '../../ecs/functions/EngineFunctions'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const sceneData = parseSceneDataCacheURLs(sceneJson, process.env.LOCAL_STORAGE_PROVIDER!)

describe.skip('Portal', () => {

  before(async () => {
    await initializeEngine(engineTestSetup)
  })

  it('Can load scene', async () => {
    const world = useWorld()
    await loadSceneFromJSON(sceneData)
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
    assert.equal(world.entityQuery().length, 10)
    // TODO: test scene actor removal directly
    assert.equal(world.physics.bodies.size, 1)
  })

  it('Can unload scene', async () => {
    // unload  
    await unloadScene()

    // test
    const world = useWorld()
    assert.equal(world.entityQuery().length, 1) // world entity
    assert.equal(world.physics.bodies.size, 0)
  })

  it('Can load new scene', async () => {
    await loadSceneFromJSON(sceneData)
    const world = useWorld()
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
    assert.equal(world.entityQuery().length, 10)
    assert.equal(world.physics.bodies.size, 1)
  })

})
