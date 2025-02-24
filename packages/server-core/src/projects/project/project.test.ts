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

import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import nock from 'nock'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { projectPath, ProjectType } from '@ir-engine/common/src/schemas/projects/project.schema'
import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { userApiKeyPath, UserApiKeyType } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { UserName, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { copyFolderRecursiveSync, deleteFolderRecursive } from '@ir-engine/common/src/utils/fsHelperFunctions'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application, HookContext } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { identityProviderDataResolver } from '../../user/identity-provider/identity-provider.resolvers'
import { useGit } from '../../util/gitHelperFunctions'

const cleanup = async (app: Application, projectName: string) => {
  const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${projectName.split('/')[0]}/`)
  deleteFolderRecursive(projectDir)
  const removingProjects = await app.service(projectPath).find({ query: { name: projectName } })
  if (removingProjects.data.length) await app.service(projectPath).remove(removingProjects.data[0].id)
}

describe('project.test', () => {
  let app: Application
  let testUserApiKey: UserApiKeyType
  let testProject: ProjectType

  const getParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
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
  })

  afterEach(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  describe('create', () => {
    it('should add new project', async () => {
      const projectName = `testorg/test-project-${uuidv4().slice(0, 8)}`

      testProject = await app.service(projectPath).create(
        {
          name: projectName
        },
        getParams()
      )

      assert.ok(testProject.id)
      assert.equal(testProject.name, projectName)
    })

    it('should not add new project with same name as existing project', async () => {
      const projectName = `testorg/test-project-${uuidv4().slice(0, 8)}`

      testProject = await app.service(projectPath).create(
        {
          name: projectName
        },
        getParams()
      )

      await assert.rejects(
        async () =>
          await app.service(projectPath).create(
            {
              name: testProject.name
            },
            getParams()
          )
      )
    })
  })

  describe('update', () => {
    let sourceDirectory: string
    let testUpdateProjectName: string

    beforeEach(async () => {
      sourceDirectory = path.resolve(appRootPath.path, `packages/projects/projects/test-cloning-directory`)
      copyFolderRecursiveSync(
        path.resolve(appRootPath.path, `packages/projects/template-project`),
        path.resolve(appRootPath.path, `packages/projects/projects`)
      )
      fs.renameSync(path.resolve(appRootPath.path, `packages/projects/projects/template-project`), sourceDirectory)

      const git = useGit(sourceDirectory)
      await git.init()
      await git.add('.')
      await git.commit('initial commit')

      testUpdateProjectName = `testorg1/test-update-project-name-${uuidv4().slice(0, 8)}`

      const projectName = `testorg1/test-project-${uuidv4().slice(0, 8)}`
      testProject = await app.service(projectPath).create(
        {
          name: projectName
        },
        getParams()
      )
    })

    afterEach(async () => {
      await cleanup(app, testUpdateProjectName)
      await cleanup(app, 'template-project')
      fs.rmSync(sourceDirectory, { force: true, recursive: true })
      await cleanup(app, testProject.name)
    })

    it('should create and add the project details if it does not exist', async () => {
      nock('https://api.github.com')
        .get(/\/user.*/)
        .reply(200, getAuthenticatedUser('test-user'))

      await app.service(projectPath).update(
        testProject.id,
        {
          sourceURL: sourceDirectory + '/', // slash is needed to force the sourceURL to be a directory
          name: testUpdateProjectName
        },
        getParams()
      )

      const updatedProject = await app
        .service(projectPath)
        .find({ query: { name: testUpdateProjectName }, ...getParams() })
      assert.ok(updatedProject.data[0].commitDate)
      assert.equal(updatedProject.data[0].name, testUpdateProjectName)
    })

    it('should update the project details if it already exists', async () => {
      nock('https://api.github.com')
        .get(/\/user.*/)
        .reply(200, getAuthenticatedUser('test-user'))

      await app.service(projectPath).update(
        testProject.id,
        {
          sourceURL: sourceDirectory + '/',
          name: testProject.name
        },
        getParams()
      )

      const updatedProject = await app.service(projectPath).get(testProject.id)
      assert.equal(updatedProject.name, testProject.name)
      assert.notEqual(updatedProject.commitDate, testProject.commitDate)
    })
  })

  describe('patch', () => {
    beforeEach(async () => {
      const projectName = `testorg1/test-project-${uuidv4().slice(0, 8)}`
      testProject = await app.service(projectPath).create(
        {
          name: projectName
        },
        getParams()
      )
    })

    afterEach(async () => {
      await cleanup(app, 'template-project')
      await cleanup(app, testProject.name)
    })

    it('should change the project data', async () => {
      const patchedProject = await app.service(projectPath).patch(testProject.id, { updateType: 'tag' })

      assert.equal(patchedProject.name, testProject.name)
      assert.equal(patchedProject.updateType, 'tag')
    })
  })

  describe('remove', () => {
    beforeEach(async () => {
      const projectName = `testorg1/test-project-${uuidv4().slice(0, 8)}`
      testProject = await app.service(projectPath).create(
        {
          name: projectName
        },
        getParams()
      )
    })

    afterEach(async () => {
      await cleanup(app, 'template-project')
      await cleanup(app, testProject.name)
    })

    it('should remove project', async function () {
      await app.service(projectPath).remove(testProject.id, getParams())

      const project = (await app
        .service(projectPath)
        .find({ query: { id: testProject.id }, ...getParams() })) as Paginated<ProjectType>
      assert.equal(project.data.length, 0)
    })
  })
})

const getAuthenticatedUser = (username: string) => ({
  login: username,
  id: 1,
  node_id: 'MDQ6VXNlcjE=',
  avatar_url: 'https://github.com/images/error/octocat_happy.gif',
  gravatar_id: '',
  url: `https://api.github.com/users/${username}`,
  html_url: `https://github.com/${username}`,
  followers_url: `https://api.github.com/users/${username}/followers`,
  following_url: `https://api.github.com/users/${username}/following{/other_user}`,
  gists_url: `https://api.github.com/users/${username}/gists{/gist_id}`,
  starred_url: `https://api.github.com/users/${username}/starred{/owner}{/repo}`,
  subscriptions_url: `https://api.github.com/users/${username}/subscriptions`,
  organizations_url: `https://api.github.com/users/${username}/orgs`,
  repos_url: `https://api.github.com/users/${username}/repos`,
  events_url: `https://api.github.com/users/${username}/events{/privacy}`,
  received_events_url: `https://api.github.com/users/${username}/received_events`,
  type: 'User',
  site_admin: false,
  name: `Test User ${username}`,
  company: 'GitHub',
  blog: 'https://github.com/blog',
  location: 'San Francisco',
  email: 'octocat@github.com',
  hireable: false,
  bio: 'There once was...',
  twitter_username: 'monatheoctocat',
  public_repos: 2,
  public_gists: 1,
  followers: 20,
  following: 0,
  created_at: '2008-01-14T04:33:35Z',
  updated_at: '2008-01-14T04:33:35Z',
  private_gists: 81,
  total_private_repos: 100,
  owned_private_repos: 100,
  disk_usage: 10000,
  collaborators: 8,
  two_factor_authentication: true,
  plan: {
    name: 'Medium',
    space: 400,
    private_repos: 20,
    collaborators: 0
  }
})
