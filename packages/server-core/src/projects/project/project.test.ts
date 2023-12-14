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

import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { ScopeType } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { UserApiKeyType, userApiKeyPath } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { UserName, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Paginated } from '@feathersjs/feathers'
import { v1 } from 'uuid'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'

const newProjectName = 'ProjectTest_test_project_name_' + Math.round(Math.random() * 1000)

const cleanup = async (app: Application) => {
  const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName}/`)
  deleteFolderRecursive(projectDir)
  const removingProjects = await app.service(projectPath).find({ query: { name: newProjectName } })
  if (removingProjects.data.length) await app.service(projectPath).remove(removingProjects.data[0].id)
}

/**
 * @todo
 * - refactor storage provider to be create as part of createFeathersKoaApp() to eliminate global scope
 * - use this to force a local storage provider and test specific files in the upload folder
 * - add tests for all combinations of state for projects
 *
 * - figure out how to mock git clone functionality (maybe override the function?)
 */

describe('project.test', () => {
  let app: Application
  let testUserApiKey: UserApiKeyType

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })
  before(async () => {
    const name = ('test-bot-user-name-' + v1()) as UserName
    const avatarName = 'test-bot-avatar-name-' + v1()

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

  after(async () => {
    await cleanup(app)
    await destroyEngine()
  })

  const getParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
    }
  })

  describe('create', () => {
    it('should add new project', async () => {
      await app.service(projectPath).create(
        {
          name: newProjectName
        },
        getParams()
      )

      const project = (await app
        .service(projectPath)
        .find({ query: { name: newProjectName }, ...getParams() })) as Paginated<ProjectType>
      assert.strictEqual(project.data[0].name, newProjectName)
    })

    it('should not add new project with same name as existing project', () => {
      assert.rejects(async () => {
        await app.service(projectPath).create(
          {
            name: newProjectName
          },
          getParams()
        )
      })
    })
  })

  describe('remove', () => {
    it('should remove project', async function () {
      const projectData = (await app
        .service(projectPath)
        .find({ query: { name: newProjectName }, ...getParams() })) as Paginated<ProjectType>
      await app.service(projectPath).remove(projectData.data[0].id, getParams())
      const project = (await app
        .service(projectPath)
        .find({ query: { name: newProjectName }, ...getParams() })) as Paginated<ProjectType>
      assert.strictEqual(project.data.length, 0)
    })
  })
})
