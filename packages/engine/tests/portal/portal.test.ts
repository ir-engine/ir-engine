import assert from 'assert'
import { processLocationChange } from '../../src/ecs/functions/EngineFunctions'
import { initializeEngine } from '../../src/initializeEngine'
import { engineTestSetup } from '../util/setupEngine'
import sceneJson from '@xrengine/projects/default-project/default.scene.json'
import { WorldScene } from '../../src/scene/functions/SceneLoading'

describe('Portal', () => {

  it('Can load scene', async () => {

    await initializeEngine(engineTestSetup)
    await WorldScene.load(sceneJson, engineCallbacks?.onSceneLoadProgress)
  })

  it('Can load gltf metadata', async () => {

    await initializeEngine(engineTestSetup)
    await processLocationChange
  })

  it('Can load gltf metadata', async () => {

    await initializeEngine(engineTestSetup)
    await processLocationChange
  })

})
