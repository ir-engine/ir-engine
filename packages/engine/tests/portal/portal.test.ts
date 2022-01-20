import assert from 'assert'
import { unloadScene } from '../../src/ecs/functions/EngineFunctions'
import sceneJson from '@xrengine/projects/default-project/empty.scene.json'
import { loadSceneFromJSON } from '../../src/scene/functions/SceneLoading'
import { useWorld } from '../../src/ecs/functions/SystemHooks'
import { Engine } from '../../src/ecs/classes/Engine'
import { EngineEvents } from '../../src/ecs/classes/EngineEvents'
import { parseSceneDataCacheURLs } from '@xrengine/server-core/src/projects/scene/scene-parser'

import appRootPath from 'app-root-path'
import dotenv from 'dotenv-flow'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const sceneData = parseSceneDataCacheURLs(sceneJson, process.env.LOCAL_STORAGE_PROVIDER!)

// TODO replace with inidivudal unit tests for relevant functions
describe.skip('Portal', () => {

  // before(async () => {
  //   await initializeEngine(engineTestSetup)
  // })

  // it('Can load scene', async () => {
  //   const world = useWorld()
  //   await loadSceneFromJSON(sceneData)
  //   EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
  //   assert.equal(world.entityQuery().length, 10)
  //   // TODO: test scene actor removal directly
  //   assert.equal(world.physics.bodies.size, 1)
  // })

  // it('Can unload scene', async () => {
  //   // unload  
  //   await unloadScene()

  //   // test
  //   const world = useWorld()
  //   assert.equal(world.entityQuery().length, 1) // world entity
  //   assert.equal(world.physics.bodies.size, 0)
  // })

  // it('Can load new scene', async () => {
  //   await loadSceneFromJSON(sceneData)
  //   const world = useWorld()
  //   EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
  //   assert.equal(world.entityQuery().length, 10)
  //   assert.equal(world.physics.bodies.size, 1)
  // })

})
