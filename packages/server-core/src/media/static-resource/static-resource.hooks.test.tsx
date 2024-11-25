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
import '../../patchEngineNode'

import '@hookstate/core'
import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { ScopeType, scopePath } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserApiKeyType, userApiKeyPath } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { UserName, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs'
import assert from 'assert'
import path from 'path/posix'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { Application, HookContext } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { identityProviderDataResolver } from '../../user/identity-provider/identity-provider.resolvers'

describe('StaticResourceHooks', () => {
  let app: Application
  let testUserApiKey: UserApiKeyType
  let testProject
  let provider
  const testFolderName = `TestFolder-${uuidv4()}`

  const getProjectParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
    }
  })

  const getParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
    },
    query: {
      projectId: testProject.id
    }
  })

  beforeEach(async () => {
    app = await createFeathersKoaApp()
    await app.setup()

    const name = ('test-project-user-name-' + uuidv4()) as UserName
    const avatarName = 'test-project-avatar-name-' + uuidv4()

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    const testUser = await app.service(userPath).create({
      name,
      isGuest: false
    })

    await app.service(scopePath).create({ userId: testUser.id, type: 'editor:write' as ScopeType })

    testUserApiKey = await app.service(userApiKeyPath).create({ userId: testUser.id })

    await app.service(identityProviderPath)._create(
      await identityProviderDataResolver.resolve(
        {
          type: 'github',
          token: `test-token-${Math.round(Math.random() * 1000)}`,
          userId: testUser.id
        },
        {} as HookContext
      )
    )

    const projectName = `testorg/test-project-${uuidv4().slice(0, 8)}`
    testProject = await app.service(projectPath).create(
      {
        name: projectName
      },
      getProjectParams()
    )
  })

  afterEach(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('Uploads and renames file with and without the use of a custom name', async function () {
    const key = 'projects/ir-engine/default-project/assets/collisioncube.glb'
    const [_, directory, file] = /(.*)\/([^\\\/]+$)/.exec(key)!

    //upload new file
    let testUpload = await app.service(staticResourcePath).create({
      key: key,
      project: testProject.name
    })

    assert.ok(testUpload.id)
    assert.equal(testUpload.name, file)
    const id = testUpload.id

    //rename without custom name
    let newFile = 'testRename.txt'
    let newKey = path.join(directory, newFile)
    let testRename = await app.service(staticResourcePath).patch(id, {
      key: newKey
    })
    assert.ok(testRename.id)
    assert.equal(testRename.name, newFile)

    //rename with custom name
    const customName = 'Custom Name'
    let testRenameCustom = await app.service(staticResourcePath).patch(id, {
      key: newKey,
      name: customName
    })
    assert.ok(testRenameCustom.id)
    assert.equal(testRenameCustom.name, customName)

    //rename with a preexisting custom name
    newFile = 'existingCustom.txt'
    newKey = path.join(directory, newFile)
    let testExistingCustom = await app.service(staticResourcePath).patch(id, {
      key: newKey
    })
    assert.ok(testExistingCustom.id)
    assert.equal(testExistingCustom.name, customName)

    //remove
    await app.service(staticResourcePath).remove(id)
  })
})
