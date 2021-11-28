import app from '../../../../server/src/app'
import { getAvatarFromStaticResources } from './avatar-helper'
import assert from 'assert'
import { generateAvatarThumbnail } from './generateAvatarThumbnail'
import fs from 'fs'
import path from 'path'
import appRootPath from 'app-root-path'

describe(('avatar.class'), () => {
  describe('generateAvatarThumbnail', () => {
    it('should generate thumbnail', async () => {
      const inputGLBBuffer = fs.readFileSync(path.resolve(appRootPath.path, 'packages/projects/default-project/avatars/CyberbotBlack.glb'))
      const thumbnailBuffer = await generateAvatarThumbnail(inputGLBBuffer)
      assert(thumbnailBuffer instanceof Buffer)
      assert(thumbnailBuffer.length > 0)
    })
  })
  describe('getAvatarFromStaticResources', () => {
    it('should get single avatar and thumbnail', async () => {
      const avatar = await getAvatarFromStaticResources(app, 'Allison')
      assert.equal(avatar.length, 1)
      assert(avatar[0].avatarId)
      assert(avatar[0].avatarURL)
      assert(avatar[0].thumbnailURL)
    })
    it('should get single avatar and thumbnail', async () => {
      const result = await getAvatarFromStaticResources(app)
      assert.equal(result.length, 7)
      for(const avatar of result) {
        assert(avatar.avatarId)
        assert(avatar.avatarURL)
        assert(avatar.thumbnailURL)
      }
    })
  })
})