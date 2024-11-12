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

import assert from 'assert'
import nock from 'nock'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { projectCheckSourceDestinationMatchPath } from '@ir-engine/common/src/schemas/projects/project-check-source-destination-match.schema'
import { projectPath, ProjectType } from '@ir-engine/common/src/schemas/projects/project.schema'
import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { userApiKeyPath, UserApiKeyType } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { UserName, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application, HookContext } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { identityProviderDataResolver } from '../../user/identity-provider/identity-provider.resolvers'
import { getRepoManifestJson1, getRepoManifestJson2 } from '../../util/mockOctokitResponses'

describe('project-check-source-destination-match.test', () => {
  let app: Application
  let testUserApiKey: UserApiKeyType

  const getTestSourceDestinationUrlQuery1 = () => ({
    sourceURL: 'https://github.com/MyOrg/my-first-project',
    destinationURL: 'https://github.com/MyOrg/my-first-project'
  })

  const getTestSourceDestinationUrlQuery2 = () => ({
    sourceURL: 'https://github.com/MyOrg/my-first-project',
    destinationURL: 'https://github.com/MyOrg/my-second-project'
  })

  const getParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
    }
  })

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()

    const name = ('test-project-user-name-' + Math.random().toString().slice(2, 12)) as UserName

    const avatar = await app.service(avatarPath).create({
      name: 'test-project-avatar-name-' + Math.random().toString().slice(2, 12)
    })

    const testUser = await app.service(userPath).create({
      name,
      isGuest: false
    })
    await app.service(scopePath).create({ userId: testUser.id, type: 'projects:read' as ScopeType })

    testUserApiKey = await app.service(userApiKeyPath).create({ userId: testUser.id })

    await app.service(identityProviderPath)._create(
      await identityProviderDataResolver.resolve(
        {
          type: 'github',
          token: `test-token-${Math.round(Math.random() * 1000)}`,
          userId: testUser.id
        },
        {} as HookContext
      ),
      getParams()
    )
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should match source and destination contents with same repos', async () => {
    nock('https://api.github.com')
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson1())

    const result = await app
      .service(projectCheckSourceDestinationMatchPath)
      .find({ query: getTestSourceDestinationUrlQuery1(), ...getParams() }, undefined as any)

    assert.ok(result)
    assert.ok(result.projectName)
    assert.equal(result.sourceProjectMatchesDestination, true)
  })

  it('should not match source and destination contents with different repos', async () => {
    nock('https://api.github.com')
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson2())

    const result = await app
      .service(projectCheckSourceDestinationMatchPath)
      .find({ query: getTestSourceDestinationUrlQuery2(), ...getParams() }, undefined as any)

    assert.ok(result)
    assert.ok(result.error)
    assert.ok(result.text)
    assert.ok(!result.sourceProjectMatchesDestination)
  })

  it('should match if destination manifest.json is empty', async () => {
    nock('https://api.github.com')
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/.*/)
      .reply(404)
      .get(/\/repos.*\/contents\/.*/)
      .reply(404)

    const result = await app
      .service(projectCheckSourceDestinationMatchPath)
      .find({ query: getTestSourceDestinationUrlQuery1(), ...getParams() }, undefined as any)

    assert.ok(result)
    assert.equal(result.sourceProjectMatchesDestination, true)
  })

  describe('installed project check', () => {
    let createdProject: ProjectType

    beforeAll(async () => {
      createdProject = await app.service(projectPath).create({
        name: 'myorg/my-first-project'
      })
    })

    afterAll(async () => {
      await app.service(projectPath).remove(createdProject.id)
    })

    it('should check if project is already installed', async () => {
      nock('https://api.github.com')
        .get(/\/repos.*\/contents\/.*/)
        .reply(200, getRepoManifestJson1())
        .get(/\/repos.*\/contents\/.*/)
        .reply(200, getRepoManifestJson1())

      const result = await app
        .service(projectCheckSourceDestinationMatchPath)
        .find({ query: getTestSourceDestinationUrlQuery1(), ...getParams() }, undefined as any)

      assert.ok(result)
      assert.ok(result.error)
    })
  })
})
