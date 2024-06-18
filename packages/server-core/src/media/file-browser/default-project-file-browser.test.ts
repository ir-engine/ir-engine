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

import { fileBrowserPath } from '@etherealengine/common/src/schemas/media/file-browser.schema'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { createFeathersKoaApp } from '../../createApp'

const fsProjectSyncEnabled = config.fsProjectSyncEnabled

const PREFIX = 'test'

const getRandomizedName = (name: string, suffix = '', prefix = PREFIX) =>
  `${prefix}-${name}-${(Math.random() + 1).toString(36).substring(7)}${suffix}`

/**prepends `projects` and appends `/` for directory paths */
const getDirectoryPath = (name: string) => 'projects/' + name + '/'

describe('file-browser.test', () => {
  let app: Application
  before(async () => {
    config.fsProjectSyncEnabled = false
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await destroyEngine()
    config.fsProjectSyncEnabled = fsProjectSyncEnabled
  })

  it('should not allow default-project files to be moved', async () => {
    const oldName = 'default.gltf'
    const oldPath = 'projects/default-project/public/scenes'
    const newName = 'defaults.gltf'
    const newPath = 'projects/default-project/test'
    const isCopy = false
    assert.rejects(app.service(fileBrowserPath).update(null, { oldName, newName, oldPath, newPath, isCopy }))
  })

  it('should allow default-project files to be copied', async () => {
    const oldName = 'default.gltf'
    const oldPath = 'projects/default-project/public/scenes'
    const newName = 'defaults.gltf'
    const newPath = 'projects/default-project/test'
    const isCopy = true
    await app.service(fileBrowserPath).update(null, { oldName, newName, oldPath, newPath, isCopy })
  })

  it('should not allow default-project files to be patched', async () => {
    const newData = getRandomizedName('new data')
    const body = Buffer.from(newData, 'utf-8')
    assert.rejects(
      app.service(fileBrowserPath).patch(null, {
        fileName: 'default.gltf',
        path: getDirectoryPath('projects/default-project/public/scenes/'),
        body,
        contentType: 'any'
      })
    )
  })

  it('should not allow default-project files to be deleted', async () => {
    assert.rejects(app.service(fileBrowserPath).remove('projects/default-project/public/scenes/default.gltf'))
  })
})
