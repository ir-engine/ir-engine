/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/
import assert from 'assert'
import {
  ABSOLUTE_URL_REGEX,
  ASSETS_REGEX,
  CSS_URL_REGEX,
  EMAIL_REGEX,
  HTTPS_REGEX,
  INVALID_FILENAME_REGEX,
  VALID_SCENE_NAME_REGEX,
  WINDOWS_RESERVED_NAME_REGEX
} from '../src/regex'

describe('regex.test', () => {
  describe('INVALID_FILENAME_REGEX', () => {
    it('should match invalid filenames', () => {
      const invalidFilenames = [
        'hello_world',
        'file<name',
        'email@example.com:80',
        'path/to/file',
        'back\\slash',
        'pipe|symbol',
        'question?mark',
        'asterisk*char',
        'control\0char',
        'another\ncontrol'
      ]
      invalidFilenames.forEach((filename) => {
        assert.ok(INVALID_FILENAME_REGEX.test(filename), `Expected '${filename}' to be invalid`)
        INVALID_FILENAME_REGEX.lastIndex = 0
      })
    })

    it('should not match valid filenames', () => {
      const validFilenames = [
        'helloworld',
        'filename',
        'emailexample.com',
        'pathtofile',
        'backslash',
        'pipesymbol',
        'questionmark',
        'asteriskchar',
        'controlchar',
        'anothercontrol'
      ]
      validFilenames.forEach((filename) => {
        assert.ok(!INVALID_FILENAME_REGEX.test(filename), `Expected '${filename}' to be valid`)
        INVALID_FILENAME_REGEX.lastIndex = 0
      })
    })
  })

  describe('WINDOWS_RESERVED_NAME_REGEX', () => {
    it('should match windows reserved names', () => {
      const reservedNames = ['CON', 'PrN', 'auX', 'NUL', 'COM0', 'com1', 'Com9', 'LPT0', 'LpT4', 'lPt9']
      reservedNames.forEach((filename) => {
        assert.ok(WINDOWS_RESERVED_NAME_REGEX.test(filename), `Expected '${filename}' to be windows reserved name`)
      })
    })

    it('should not match common filenames', () => {
      const validFilenames = [
        'helloworld',
        'filename',
        'emailexample.com',
        'pathtofile',
        'backslash',
        'pipesymbol',
        'questionmark',
        'asteriskchar',
        'controlchar',
        'anothercontrol'
      ]
      validFilenames.forEach((filename) => {
        assert.ok(!WINDOWS_RESERVED_NAME_REGEX.test(filename), `Expected '${filename}' to be valid filename`)
      })
    })
  })

  describe('VALID_SCENE_NAME_REGEX', () => {
    it('should match valid scene names', () => {
      const validSceneNames = [
        'A123',
        'file_name',
        'user-name',
        '12345',
        'test file',
        'my-file_123',
        'Name123_456-789',
        'a_b_c_d-e_f_g-h_i_j-k_l_m-n_o-p-q_r-s_t-u_v-w_x-y_z0123456789_-'
      ]
      validSceneNames.forEach((filename) => {
        assert.ok(VALID_SCENE_NAME_REGEX.test(filename), `Expected '${filename}' to be valid scene names`)
      })
    })

    it('should not match invalid scene names', () => {
      const invalidSceneNames = [
        'A1',
        '_test',
        'invalid!',
        'very_long_string_that_is_definitely_not_going_to_match_the_regex_because_it_is_way_too_long_for_the_pattern',
        '--double-hyphen',
        '...'
      ]
      invalidSceneNames.forEach((filename) => {
        assert.ok(!VALID_SCENE_NAME_REGEX.test(filename), `Expected '${filename}' to be invalid scene names`)
      })
    })
  })

  describe('CSS_URL_REGEX', () => {
    afterEach(() => {
      // Reset the regex to its initial state, because .exec keeps track of the last index
      CSS_URL_REGEX.lastIndex = 0
    })

    it('Positive: @import url with double quotes', () => {
      const match = CSS_URL_REGEX.exec('@import url("https://example.com/styles.css");')
      assert.ok(match, 'Expected match but got null')
      const resource = match[2] || match[3]

      assert.equal(
        resource,
        'https://example.com/styles.css',
        `Expected 'https://example.com/styles.css' but got '${resource}'`
      )
    })

    it('Positive: url with double quotes', () => {
      const match = CSS_URL_REGEX.exec('background: url("https://example.com/image.jpg");')
      assert.ok(match, 'Expected match but got null')
      const resource = match[2] || match[3]

      assert.equal(
        resource,
        'https://example.com/image.jpg',
        `Expected 'https://example.com/image.jpg' but got '${resource}'`
      )
    })

    it('Positive: url with single quotes', () => {
      const match = CSS_URL_REGEX.exec("background: url('https://example.com/image.jpg');")
      assert.ok(match, 'Expected match but got null')
      const resource = match[2] || match[3]

      assert.equal(
        resource,
        'https://example.com/image.jpg',
        `Expected 'https://example.com/image.jpg' but got '${resource}'`
      )
    })

    it('Positive: url with no quotes', () => {
      const match = CSS_URL_REGEX.exec('background: url(https://example.com/image.jpg);')
      assert.ok(match, 'Expected match but got null')
      const resource = match[2] || match[3]

      assert.equal(
        resource,
        'https://example.com/image.jpg',
        `Expected 'https://example.com/image.jpg' but got '${resource}'`
      )
    })

    it('Negative: should not match invalid CSS imports & URLs', () => {
      assert.ok(!CSS_URL_REGEX.test('color: #fff;'))
      assert.ok(!CSS_URL_REGEX.test('background: urll(https://example.com/image.jpg);')) // Misspelled 'url'
      assert.ok(!CSS_URL_REGEX.test('url(https://example.com/image')) // Missing closing parenthesis
      assert.ok(!CSS_URL_REGEX.test('background: url();')) // Empty URL
    })
  })

  describe('ABSOLUTE_URL_REGEX', () => {
    it('should match absolute URLs', () => {
      const positiveCases = ['http://example.com', 'https://example.com', 'ftp://example.com', '//example.com']

      positiveCases.forEach((url) => {
        assert.match(url, ABSOLUTE_URL_REGEX)
      })
    })

    it('should not match relative URLs', () => {
      assert.doesNotMatch('example.com', ABSOLUTE_URL_REGEX)
    })
  })

  describe('HTTPS_REGEX', () => {
    it('should match https URLs', () => {
      const positiveCases = [
        'https://example.com',
        'https://www.example.com',
        'https://subdomain.example.com',
        'https://example.com/path/to/resource',
        'https://127.0.0.1',
        'https://[::1]',
        'https://localhost'
      ]

      positiveCases.forEach((url) => {
        assert.match(url, HTTPS_REGEX, `Expected '${url}' to match HTTPS_REGEX`)
      })
    })
    it('should not match any other URLs', () => {
      const negativeCases = [
        'http://',
        'http://example.com',
        'http://www.example.com',
        'ftp://example.com',
        'https:/',
        'https:',
        'https'
      ]

      negativeCases.forEach((url) => {
        assert.doesNotMatch(url, HTTPS_REGEX, `Expected '${url}' to not match HTTPS_REGEX`)
      })
    })
  })

  describe('EMAIL_REGEX', () => {
    it('should match valid emails', () => {
      const positiveCases = [
        'simple@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
        'other.email-with-hyphen@example.com',
        'fully-qualified-domain@example.com',
        'user.name+tag+sorting@example.com',
        'x@example.com',
        'example-indeed@strange-example.com',
        'mailhost!username@example.org',
        'user%example.com@example.org',
        'user-@example.org'
      ]

      positiveCases.forEach((email) => {
        assert.match(email, EMAIL_REGEX)
      })
    })

    it('should not match invalid emails', () => {
      const negativeCases = [
        'plainaddress',
        '@missingusername.com',
        'username@.com.',
        '.username@yahoo.com',
        'username@yahoo.com.',
        'username@yahoo..com',
        'username@yahoo.c',
        'username@yahoo.corporate',
        'username@-example.com',
        'username@example.com-',
        'username@example..com',
        'username@111.222.333.44444',
        'username@example..com',
        'username@-example.com'
      ]
      negativeCases.forEach((email) => {
        assert.doesNotMatch(email, EMAIL_REGEX)
      })
    })
  })

  describe('ASSETS_REGEX', () => {
    it('should match assets URLs', () => {
      const positiveCases = [
        'https://example.com/projects/default-project/assets/images/logo.png',
        'https://example.com/projects/default-project/assets/animations/emotes.glb',
        'https://example.com/projects/default-project/assets/animations/locomotion.glb'
      ]
      positiveCases.forEach((url) => {
        assert.match(url, ASSETS_REGEX)
      })
    })

    it('should not match non-assets URLs', () => {
      const negativeCases = [
        'https://example.com/projects/default-project/scene.json',
        'https://example.com/projects/default-project/assets',
        'https://example.com/default-project/assets/animations/emotes.glb'
      ]
      negativeCases.forEach((url) => {
        assert.doesNotMatch(url, ASSETS_REGEX)
      })
    })
  })
})
