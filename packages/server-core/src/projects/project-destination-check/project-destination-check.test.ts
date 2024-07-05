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
import nock from 'nock'
import { v4 as uuidv4 } from 'uuid'

import {
  avatarPath,
  identityProviderPath,
  projectDestinationCheckPath,
  ScopeType,
  userApiKeyPath,
  UserApiKeyType,
  UserName,
  userPath
} from '@etherealengine/common/src/schema.type.module'
import { destroyEngine } from '@etherealengine/ecs'

import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import {
  getRepoManifestJson1,
  getRepoManifestJson2,
  getTestAuthenticatedUser,
  getTestUserRepos
} from '../../util/mockOctokitResponses'

describe('project-destination-check.test', () => {
  let app: Application
  let testUserApiKey: UserApiKeyType

  const getParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
    }
  })

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    const name = ('test-project-destination-check-user-name-' + uuidv4()) as UserName

    const avatar = await app.service(avatarPath).create({
      name: 'test-project-destination-check-avatar-name-' + uuidv4()
    })

    const testUser = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest: false,
      scopes: [{ type: 'projects:read' as ScopeType }]
    })

    testUserApiKey = await app.service(userApiKeyPath).create({ userId: testUser.id })

    await app.service(identityProviderPath).create(
      {
        type: 'github',
        token: uuidv4(),
        userId: testUser.id
      },
      getParams()
    )
  })

  afterEach(() => nock.cleanAll())

  after(() => destroyEngine())

  it('should check for accessible repo', async () => {
    nock('https://api.github.com')
      .get(/\/user.*/)
      .reply(200, getTestAuthenticatedUser('test-non-owner'))
      .get(/\/user.*\/repos.*/)
      .reply(200, [])

    const result = await app
      .service(projectDestinationCheckPath)
      .get('https://github.com/MyOrg/my-first-project', getParams())

    assert.ok(result)
    assert.ok(result.error)
  })

  it('should check for empty project repository', async () => {
    nock('https://api.github.com')
      .get(/\/user.*/)
      .reply(200, getTestAuthenticatedUser('MyOrg'))
      .get(/\/user.*\/repos.*/)
      .reply(200, getTestUserRepos())
      .get(/\/repos.*\/contents\/*/)
      .reply(404)
      .get(/\/repos.*\/contents\/*/)
      .reply(404)

    const result = await app
      .service(projectDestinationCheckPath)
      .get('https://github.com/MyOrg/my-first-project', getParams())

    assert.ok(result)
    assert.equal(result.destinationValid, true)
    assert.equal(result.repoEmpty, true)
  })

  it('should check if the destination project and existing project are same', async () => {
    nock('https://api.github.com')
      .get(/\/user.*/)
      .reply(200, getTestAuthenticatedUser('MyOrg'))
      .get(/\/user.*\/repos.*/)
      .reply(200, getTestUserRepos())
      .get(/\/repos.*\/contents\/*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/*/)
      .reply(200, getRepoManifestJson2())

    const result = await app.service(projectDestinationCheckPath).get('https://github.com/MyOrg/my-first-project', {
      query: {
        inputProjectURL: 'https://github.com/MyOrg/ee-bot'
      },
      ...getParams()
    })

    assert.ok(result)
    assert.ok(result.error)
  })

  it('should check destination match', async () => {
    nock('https://api.github.com')
      .get(/\/user.*/)
      .reply(200, getTestAuthenticatedUser('MyOrg'))
      .get(/\/user.*\/repos.*/)
      .reply(200, getTestUserRepos())
      .get(/\/repos.*\/contents\/*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/*/)
      .reply(200, getRepoManifestJson1())

    const result = await app.service(projectDestinationCheckPath).get('https://github.com/MyOrg/my-first-project', {
      query: {
        inputProjectURL: 'https://github.com/MyOrg/my-first-project'
      },
      ...getParams()
    })

    assert.ok(result)
    assert.equal(result.destinationValid, true)
  })
})
