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
import { STATIC_ASSET_REGEX } from './pathResolver'

describe('STATIC_ASSET_REGEX', () => {
  it('should match static asset URLs', () => {
    const positiveCases = [
      {
        url: 'https://example.com/projects/ir-engine/default-project/assets/images/logo.png',
        orgName: 'ir-engine',
        projectName: 'default-project',
        assetPath: 'assets/images/logo.png'
      },
      {
        url: 'https://example.com/static-resources/ir-engine/default-project/assets/images/logo.png',
        orgName: 'ir-engine',
        projectName: 'default-project',
        assetPath: 'assets/images/logo.png'
      },
      {
        url: 'https://example.com/projects/ir-engine/default-project/assets/animations/emotes.glb',
        orgName: 'ir-engine',
        projectName: 'default-project',
        assetPath: 'assets/animations/emotes.glb'
      },
      {
        url: 'https://example.com/projects/ir-engine/default-project/assets/animations/locomotion.glb',
        orgName: 'ir-engine',
        projectName: 'default-project',
        assetPath: 'assets/animations/locomotion.glb'
      }
    ]
    positiveCases.forEach(({ url, orgName, projectName, assetPath }) => {
      const match = STATIC_ASSET_REGEX.exec(url)
      assert.ok(match, `Expected '${url}' to match STATIC_ASSET_REGEX`)
      assert.equal(match?.[1], orgName, `Expected org name name '${orgName}' in '${url}'. Found ${match?.[1]}`)
      assert.equal(match?.[2], projectName, `Expected project name '${projectName}' in '${url}'. Found ${match?.[2]}`)
      assert.equal(match?.[3], assetPath, `Expected asset path '${assetPath}' in '${url}'. Found ${match?.[3]}`)
    })
  })

  it('should not match non-static asset URLs', () => {
    const negativeCases = [
      'https://example.com/static-resources/',
      'https://example.com/project/subdir/assets',
      'https://example.com/ir-engine/default-project/assets/animations/emotes.glb'
    ]
    negativeCases.forEach((url) => {
      assert.doesNotMatch(url, STATIC_ASSET_REGEX, `Expected '${url}' to not match STATIC_ASSET_REGEX`)
    })
  })
})
