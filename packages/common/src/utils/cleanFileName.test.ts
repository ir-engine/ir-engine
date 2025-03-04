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
import { cleanFileNameString, getDecodedFileName, getEncodedFileName } from './cleanFileName'

describe('getEncodedFileName', () => {
  it('should handle normal text without special characters', () => {
    assert.equal(getEncodedFileName('hello'), 'hello')
    assert.equal(getEncodedFileName('hello world'), 'hello-world')
  })

  it('should preserve hyphens by doubling them', () => {
    assert.equal(getEncodedFileName('hello-world'), 'hello--world')
    assert.equal(getEncodedFileName('test-file-name'), 'test--file--name')
  })

  it('should handle parentheses', () => {
    assert.equal(getEncodedFileName('(test)'), 'x_test--y')
    assert.equal(getEncodedFileName('folder (1)'), 'folder-_1--y')
    assert.equal(getEncodedFileName('(2)'), 'x_2--y')
  })

  it('should handle spaces and special characters', () => {
    assert.equal(getEncodedFileName('New Folder (2)'), 'New-Folder-_2--y')
    assert.equal(getEncodedFileName('test - file'), 'test----file')
    assert.equal(getEncodedFileName(' space '), 'x-space-y')
  })
})

describe('getDecodedFileName', () => {
  it('should handle normal text without special characters', () => {
    assert.equal(getDecodedFileName('hello'), 'hello')
    assert.equal(getDecodedFileName('hello-world'), 'hello world')
  })

  it('should decode double hyphens back to single hyphen', () => {
    assert.equal(getDecodedFileName('hello--world'), 'hello-world')
    assert.equal(getDecodedFileName('test--file--name'), 'test-file-name')
  })

  it('should decode encoded parentheses', () => {
    assert.equal(getDecodedFileName('x_test-y'), '(test)')
    assert.equal(getDecodedFileName('folder-_1-y'), 'folder (1)')
    assert.equal(getDecodedFileName('x_2-y'), '(2)')
  })

  it('should handle numbers correctly', () => {
    assert.equal(getDecodedFileName('version-2'), 'version 2')
    assert.equal(getDecodedFileName('v2-test'), 'v2 test')
    assert.equal(getDecodedFileName('test-2-v3'), 'test 2 v3')
  })
})

describe('cleanFileNameString', () => {
  it('should return a cleaned version of the filename', () => {
    const fullFileName = 'path/to/file/file_name.txt'
    const result = cleanFileNameString(fullFileName)
    assert.equal(result, 'path/to/file/file_name.txt')
  })

  it('should return a cleaned version of the filename even if it doesnt have and extension', () => {
    const fullFileName = 'path/to/file/file_name'
    const result = cleanFileNameString(fullFileName)
    assert.equal(result, 'path/to/file/file_name')
  })

  it('should return a cleaned version of the filename with a truncated name', () => {
    const fullFileName = 'path/to/file/' + 'a'.repeat(1000) + '.txt'
    const result = cleanFileNameString(fullFileName)
    assert.equal(result, 'path/to/file/' + 'a'.repeat(64) + '.txt')
  })

  it('should respect multiple spaces in the file name', () => {
    const fullFileName = 'path/to/file/file name with spaces.txt'
    const result = cleanFileNameString(fullFileName)
    assert.equal(result, 'path/to/file/file-name-with-spaces.txt')
  })
})
