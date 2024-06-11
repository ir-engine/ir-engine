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

import { assetPath } from '@etherealengine/common/src/schema.type.module'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { createFeathersKoaApp } from '../../createApp'

const fsProjectSyncEnabled = config.fsProjectSyncEnabled

describe('asset.test', () => {
  let app: Application
  let projectName: string
  const params = { isInternal: true }

  before(async () => {
    config.fsProjectSyncEnabled = false
    app = createFeathersKoaApp()
    await app.setup()
    projectName = `default-project`
  })

  after(async () => {
    await destroyEngine()
    config.fsProjectSyncEnabled = fsProjectSyncEnabled
  })

  it('should not allow patches to default-project files', async () => {
    const assetResult = await app.service(assetPath).find({
      query: {
        assetURL: 'projects/default-project/public/scenes/default.gltf'
      }
    })

    const asset = assetResult.data[0]

    assert.rejects(
      async () =>
        await app.service(assetPath).patch(
          asset.id,
          {
            assetURL: 'projects/default-project/test/default.gltf',
            project: projectName
          },
          params
        )
    )
  })

  it('should not allow updates to default-project files', async () => {
    const assetResult = await app.service(assetPath).find({
      query: {
        assetURL: 'projects/default-project/public/scenes/apartment.gltf'
      }
    })

    const asset = assetResult.data[0]

    assert.rejects(async () =>
      app.service(assetPath).update(
        asset.id,
        {
          assetURL: 'projects/default-project/public/scenes/default.gltf',
          project: projectName
        },
        params
      )
    )
  })

  it('should not allow deletions of default-project files', async () => {
    const assetResult = await app.service(assetPath).find({
      query: {
        assetURL: 'projects/default-project/public/scenes/sky-station.gltf'
      }
    })

    const asset = assetResult.data[0]

    assert.rejects(async () => app.service(assetPath).remove(asset.id, params))
  })
})
