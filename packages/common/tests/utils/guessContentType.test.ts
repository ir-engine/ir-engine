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

import { guessContentType } from '../../src/utils/guessContentType'

describe('guessContentType', () => {
  it('guessContentType', () => {
    assert(guessContentType('https://mydomain.com/myfile.mat'), 'model/material')
    assert(guessContentType('https://mydomain.com/myfile.gltf'), 'model/gltf')
    assert(guessContentType('https://mydomain.com/myfile.glb'), 'model/gltf-binary')
    assert(guessContentType('https://mydomain.com/myfile.png'), 'image/png')
    assert(guessContentType('https://mydomain.com/myfile.jpg'), 'image/jpeg')
    assert(guessContentType('https://mydomain.com/myfile.jpeg'), 'image/jpeg')
    assert(guessContentType('https://mydomain.com/myfile.pdf'), 'application/pdf')
    assert(guessContentType('https://mydomain.com/myfile.mp4'), 'video/mp4')
    assert(guessContentType('https://mydomain.com/myfile.mp3'), 'audio/mpeg')
    assert(guessContentType('https://mydomain.com/myfile.tsx'), 'application/octet-stream')
    assert(guessContentType('https://mydomain.com/myfile.ts'), 'application/octet-stream')
    assert(guessContentType('https://mydomain.com/myfile.js'), 'application/octet-stream')
  })
})
