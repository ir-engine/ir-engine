/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import assert from 'assert'
import { describe, it } from 'vitest'
import { MATCH_ASSET_PROJECT_FILENAME_REGEX } from '../regex'

describe('Model Transform Functions', () => {
  describe('MATCH_ASSET_PROJECT_FILENAME_REGEX', () => {
    it('should match valid asset project paths', () => {
      const validProjectPaths = [
        {
          url: 'https://ir.world:8642/projects/ir-engine/default-project/assets/collisioncube-LOD0.glb',
          orgAndProjName: 'ir-engine/default-project',
          assetName: 'collisioncube-LOD0.glb'
        },
        {
          url: 'https://ir.world:8642/projects/ir-engine/default-project/public/collisioncube-LOD0.glb',
          orgAndProjName: 'ir-engine/default-project',
          assetName: 'collisioncube-LOD0.glb'
        },
        {
          url: 'https://ir.world:8642/projects/ir-engine/testproj/assets/collisioncube-LOD0.glb',
          orgAndProjName: 'ir-engine/testproj',
          assetName: 'collisioncube-LOD0.glb'
        },
        {
          url: 'https://ir.world:8642/projects/ir-engine/testproj/public/collisioncube-LOD0.glb',
          orgAndProjName: 'ir-engine/testproj',
          assetName: 'collisioncube-LOD0.glb'
        },
        {
          url: 'https://ir.world:8642/projects/ir-engine/testproj/public/publish/scene/collisioncube-LOD0.glb',
          orgAndProjName: 'ir-engine/testproj',
          assetName: 'collisioncube-LOD0.glb'
        }
      ]

      /**
       * https://ir.world/projects/ir-engine/default-project/assets/collisioncube-LOD0.glb
       * Match 1: projects/ir-engine/default-project/assets/collisioncube-LOD0.glb
       * Group 1: ir-engine/default-project
       * Group 2: collisioncube-LOD0.glb
       */
      validProjectPaths.forEach((filename) => {
        const match = MATCH_ASSET_PROJECT_FILENAME_REGEX.exec(filename.url)
        assert.ok(match, `Expected '${filename.url}' to be valid`)
        assert.equal(
          match?.[1],
          filename.orgAndProjName,
          `Expected org/proj name '${filename.orgAndProjName}' in '${filename.url}'. Found ${match?.[1]}`
        )
        assert.equal(
          match?.[2],
          filename.assetName,
          `Expected asset name '${filename.assetName}' in '${filename.url}'. Found ${match?.[2]}`
        )
      })
    })

    it('should not match invalid asset project paths', () => {
      const invalidProjectPaths = [
        'https://ir.world:8642/projects/ir-engine/default-project/blah/collisioncube-LOD0.glb',
        'https://ir.world:8642/projects/ir-engine/default-project/custom-prefabs/collisioncube-LOD0.glb'
      ]
      invalidProjectPaths.forEach((filename) => {
        assert.ok(!MATCH_ASSET_PROJECT_FILENAME_REGEX.test(filename), `Expected '${filename}' to be invalid`)
      })
    })
  })
})
