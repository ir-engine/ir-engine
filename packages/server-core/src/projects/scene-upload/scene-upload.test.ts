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

import { parseStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { sceneUploadPath } from '@etherealengine/engine/src/schemas/projects/scene-upload.schema'
import { SceneJsonType, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { ScopeType } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { UserApiKeyType, userApiKeyPath } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { UserName, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'
import assert from 'assert'
import { v1 } from 'uuid'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

describe('scene-upload.test', () => {
  let app: Application
  let projectName: string
  let testUserApiKey: UserApiKeyType

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  before(async () => {
    projectName = `test-scene-project-${v1()}`
    await app.service(projectPath).create({ name: projectName })

    const name = ('test-scene-upload-user-name-' + v1()) as UserName
    const avatarName = 'test-scene-upload-avatar-name-' + v1()

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    const testUser = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest: false,
      scopes: [{ type: 'editor:write' as ScopeType }]
    })

    testUserApiKey = await app.service(userApiKeyPath).create({ userId: testUser.id })
  })

  it('should upload a new scene', async () => {
    const sceneName = `test-scene-name-${v1()}`
    const sceneData = structuredClone(defaultSceneSeed) as unknown as SceneJsonType
    const parsedSceneData = parseStorageProviderURLs(structuredClone(defaultSceneSeed))

    await app.service(sceneUploadPath).create(
      { project: projectName, name: sceneName, sceneData },
      {
        files: [],
        provider: 'rest',
        headers: {
          authorization: `Bearer ${testUserApiKey.token}`
        }
      }
    )

    const uploadedSceneData = await app
      .service(scenePath)
      .get(null, { query: { project: projectName, name: sceneName, metadataOnly: false } })

    assert.equal(uploadedSceneData.name, sceneName)
    assert.equal(uploadedSceneData.project, projectName)
    assert.deepStrictEqual(uploadedSceneData.scene, parsedSceneData)
  })
})
