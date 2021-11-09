import assert from 'assert'
import { unloadScene } from '../../src/ecs/functions/EngineFunctions'
import { initializeEngine } from '../../src/initializeEngine'
import { engineTestSetup } from '../util/setupEngine'
import sceneJson from '@xrengine/projects/default-project/default.scene.json'
import { WorldScene } from '../../src/scene/functions/SceneLoading'
import { useWorld } from '../../src/ecs/functions/SystemHooks'
import { Engine } from '../../src/ecs/classes/Engine'
import { EngineEvents } from '../../src/ecs/classes/EngineEvents'
import { parseSceneDataCacheURLs } from '@xrengine/server-core/src/world/scene/scene-parser'

import appRootPath from 'app-root-path'
import dotenv from 'dotenv-flow'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const sceneData = parseSceneDataCacheURLs(sceneJson, process.env.LOCAL_STORAGE_PROVIDER!)
console.log(sceneData, process.env.LOCAL_STORAGE_PROVIDER)
describe('Portal', () => {

  before(async () => {
    await initializeEngine(engineTestSetup)
  })

  it('Can load scene', async () => {
    const world = useWorld()
    await WorldScene.load(sceneData)
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
    assert.equal(world.entities.length, 10)
    // TODO: test scene actor removal directly
    assert.equal(world.physics.bodies.size, 1)
  })

  it('Can unload scene', async () => {
    // unload
    Engine.engineTimer.stop()
    Engine.sceneLoaded = false
    WorldScene.isLoading = false    
    await unloadScene()
    Engine.engineTimer.start()

    // test
    const world = useWorld()
    assert.equal(world.entities.length, 1) // world entity
    assert.equal(world.physics.bodies.size, 0)
  })

  it('Can load new scene', async () => {
    await WorldScene.load(sceneData)
    const world = useWorld()
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
    assert.equal(world.entities.length, 10)
    assert.equal(world.physics.bodies.size, 1)
  })

})
