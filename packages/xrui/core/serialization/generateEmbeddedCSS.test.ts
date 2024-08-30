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
import { CSS_URL_REGEX } from './generateEmbeddedCSS'

describe('CSS_URL_REGEX', () => {
  it('should match for CSS sources with valid URLs', () => {
    const positiveCases = [
      {
        source: '@import url("https://example.com/styles.css");',
        urlResource: 'https://example.com/styles.css'
      },
      {
        source: 'background: url("https://example.com/image.jpg");',
        urlResource: 'https://example.com/image.jpg'
      },
      {
        source: "background: url('https://example.com/image.jpg');",
        urlResource: 'https://example.com/image.jpg'
      },
      {
        source: 'background: url(https://example.com/image.jpg);',
        urlResource: 'https://example.com/image.jpg'
      }
    ]

    positiveCases.forEach(({ source, urlResource }) => {
      const matches = source.matchAll(CSS_URL_REGEX)

      const matchesArray = Array.from(matches)
      assert.ok(matchesArray.length > 0, `Expected '${source}' to match CSS_URL_REGEX`)

      for (const match of matchesArray) {
        assert.equal(
          match[2] ?? match[3],
          urlResource,
          `Expected URL resource: ${urlResource} in '${source}'. Found ${match[2] ?? match[3]}`
        )
      }
    })
  })

  it('should not match invalid CSS imports & URLs', () => {
    const negativeCases = [
      'color: #fff;',
      'background: urll(https://example.com/image.jpg);', // Misspelled 'url'
      'url(https://example.com/image', // Missing closing parenthesis
      'background: url();' // Empty URL
    ]

    negativeCases.forEach((source) => {
      const matches = source.matchAll(CSS_URL_REGEX)
      const matchesArray = Array.from(matches)
      assert.ok(matchesArray.length === 0, `Expected '${source}' to not match CSS_URL_REGEX`)
    })
  })
})
