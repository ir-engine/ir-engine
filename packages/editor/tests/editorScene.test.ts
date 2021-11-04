import assert from 'assert'
import { ProjectManager } from '../src/managers/ProjectManager'
import defaultSceneData from '../../projects/projects/theoverlay/default.scene.json'
import { EngineSystemPresets, InitializeOptions } from '../../engine/src/initializationOptions'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'

const initializationOptions: InitializeOptions = {
  type: EngineSystemPresets.EDITOR,
  publicPath: location.origin
}

describe('Scene Service', () => {

  before(async () => {
    await initializeEngine(initializationOptions)
    await ProjectManager.instance.init()
  })

  it("should load default test scene", async function () {
    await ProjectManager.instance.loadProject(defaultSceneData)
  })

  after(() => {
  })
})
