import assert from 'assert'
import { describe, it } from 'vitest'
import { MATCH_ASSET_PROJECT_FILENAME_REGEX } from './ModelTransformFunctions'

describe('Model Transform Functions', () => {
  describe('MATCH_ASSET_PROJECT_FILENAME_REGEX', () => {
    it('should match valid asset project paths', () => {
      const validProjectPaths = ['https://ir.world:8642/projects/ir-engine/assets/public/collisioncube-LOD0.glb']
      validProjectPaths.forEach((filename) => {
        assert.ok(MATCH_ASSET_PROJECT_FILENAME_REGEX.test(filename), `Expected '${filename}' to be invalid`)
      })
    })
  })
})
