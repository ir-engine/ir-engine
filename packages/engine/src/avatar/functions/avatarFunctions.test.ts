import assert from 'assert'
import { Engine } from '../../ecs/classes/Engine'
import { createWorld } from '../../ecs/classes/World'
import fs from 'fs'
import path from 'path'
import { getLoader } from '../../assets/functions/LoadGLTF'
import { setupAvatar } from './avatarFunctions'
import { SkeletonUtils } from '../SkeletonUtils'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import appRootPath from 'app-root-path'
import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'

const testModel = path.join(appRootPath.path, '/packages/projects/default-project/public/avatars/CyberbotRed.glb')
const loader = getLoader()

const toArrayBuffer = (buf) => {
  const arrayBuffer = new ArrayBuffer(buf.length)
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return arrayBuffer
}

describe('avatarFunctions', async () => {
  await loadDRACODecoder()

  const loadAsset = async () => {
    const modelBuffer = toArrayBuffer(await fs.promises.readFile(testModel))
    return new Promise((resolve, reject) => loader.parse(modelBuffer, './', resolve, reject))
  }

  beforeEach(async () => {
    const world = createWorld()
    Engine.currentWorld = world
  })

  afterEach(async () => {})

  describe('setupAvatar', () => {
    it('should set up avatar', async () => {
      // get asset data
      const asset = await loadAsset()

      // mock avatar entity

      const entity = createEntity()
      // add all necessary components

      setupAvatar(entity, SkeletonUtils.clone(asset))

      // assert something
      // assert()
    })
  })
})
