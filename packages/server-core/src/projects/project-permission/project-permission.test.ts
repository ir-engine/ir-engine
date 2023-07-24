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

import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import { ProjectPermissionInterface } from '@etherealengine/common/src/interfaces/ProjectPermissionInterface'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { UserApiKeyType, userApiKeyPath } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'

const newProjectName1 = 'ProjectTest_test_project_name_1'

const cleanup = async (app: Application) => {
  const project1Dir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName1}/`)
  deleteFolderRecursive(project1Dir)
  try {
    await app.service('project').Model.destroy({ where: { name: newProjectName1 } })
  } catch (e) {}
}

/**
 * @todo
 * - refactor storage provider to be create as part of createFeathersKoaApp() to eliminate global scope
 * - use this to force a local storage provider and test specific files in the upload folder
 * - add tests for all combinations of state for projects
 *
 * - figure out how to mock git clone functionality (maybe override the function?)
 */

describe('project-permission.test', () => {
  let app: Application
  let user1: UserInterface
  let user2: UserInterface
  let user3: UserInterface
  let user4: UserInterface
  let project1, project1Permission1, project1Permission2, project1Permission4
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    await cleanup(app)
    const avatarName = 'CyberbotGreen'

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    user1 = (await app.service('user').create({
      name: `Test #${Math.random()}`,
      avatarId: avatar.id,
      isGuest: false
    })) as UserInterface
    user2 = (await app.service('user').create({
      name: `Test #${Math.random()}`,
      avatarId: avatar.id,
      isGuest: false
    })) as UserInterface
    user3 = (await app.service('user').create({
      name: `Test #${Math.random()}`,
      avatarId: avatar.id,
      isGuest: false
    })) as UserInterface
    user4 = (await app.service('user').create({
      name: `Test #${Math.random()}`,
      avatarId: avatar.id,
      isGuest: false
    })) as UserInterface
    const user1ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user1.id
      }
    })) as Paginated<UserApiKeyType>
    user1.apiKey = user1ApiKeys.data.length > 0 ? user1ApiKeys.data[0] : user1.apiKey
    const user2ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user2.id
      }
    })) as Paginated<UserApiKeyType>
    user2.apiKey = user2ApiKeys.data.length > 0 ? user2ApiKeys.data[0] : user2.apiKey
    const user3ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user3.id
      }
    })) as Paginated<UserApiKeyType>
    user3.apiKey = user3ApiKeys.data.length > 0 ? user3ApiKeys.data[0] : user3.apiKey
    const user4ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user4.id
      }
    })) as Paginated<UserApiKeyType>
    user4.apiKey = user4ApiKeys.data.length > 0 ? user4ApiKeys.data[0] : user4.apiKey
    await app.service('scope').create({
      type: 'editor:write',
      userId: user1.id
    })
    await app.service('scope').create({
      type: 'editor:write',
      userId: user2.id
    })
    await app.service('scope').create({
      type: 'editor:write',
      userId: user3.id
    })
    await app.service('scope').create({
      type: 'editor:write',
      userId: user4.id
    })
    await app.service('scope').create({
      type: 'admin:admin',
      userId: user4.id
    })
  })
  after(() => {
    return destroyEngine()
  })

  describe("'project-permission' service'", () => {
    describe('create', () => {
      it('should add a new project owned by creating user', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }
        project1 = await app.service('project').create(
          {
            name: newProjectName1
          },
          params
        )
        const projectPermission = (await app.service('project-permission').find({
          query: {
            projectId: project1.id,
            userId: user1.id
          },
          ...params
        })) as Paginated<ProjectPermissionInterface>
        project1Permission1 = projectPermission.data[0]
        assert.strictEqual(projectPermission.total, 1)
        assert.strictEqual(project1Permission1.userId, user1.id)
        assert.strictEqual(project1Permission1.projectId, project1.id)
        assert.strictEqual(project1Permission1.type, 'owner')
      })

      it('should create a new project-permission if requested by the owner', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }
        project1Permission2 = (await app.service('project-permission').create(
          {
            projectId: project1.id,
            userId: user2.id
          },
          params
        )) as ProjectPermissionInterface
        assert.ok(project1Permission2)
        assert.strictEqual(project1Permission2.userId, user2.id)
        assert.strictEqual(project1Permission2.projectId, project1.id)
        assert.strictEqual(project1Permission2.type, 'user')
      })

      it('should return the same project-permission if another create request for a project/user combination is made', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }
        const duplicate = (await app.service('project-permission').create(
          {
            projectId: project1.id,
            userId: user2.id
          },
          params
        )) as ProjectPermissionInterface
        assert.ok(duplicate)
        assert.strictEqual(project1Permission2.id, duplicate.id)
      })

      it('should throw an error if the projectId is invalid', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }

        assert.rejects(
          async () => {
            await app.service('project-permission').create(
              {
                projectId: 'abcdefg',
                userId: user2.id
              },
              params
            )
          },
          { message: 'Invalid project ID' }
        )
      })

      it('should throw an error if the userId is invalid', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }

        assert.rejects(
          async () => {
            await app.service('project-permission').create(
              {
                projectId: project1.id,
                userId: 'abcdefg'
              },
              params
            )
          },
          { message: 'Invalid user ID and/or user invite code' }
        )
      })

      it('should not allow a user who does not have owner permission on a project to create new permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }

        assert.rejects(
          async () => {
            try {
              const res = await app.service('project-permission').create(
                {
                  projectId: project1.id,
                  userId: user3.id
                },
                params
              )
            } catch (err) {
              throw err
            }
          },
          { message: 'You are not an owner of this project' }
        )
      })

      it('should not allow a user with no permission on a project to create new permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user3.apiKey.token}`
          },
          provider: 'rest'
        }

        assert.rejects(
          async () => {
            await app.service('project-permission').create(
              {
                projectId: project1.id,
                userId: user3.id
              },
              params
            )
          },
          { message: 'You are not an owner of this project' }
        )
      })

      it('should allow an admin user to create new permissions for a project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user4.apiKey.token}`
          },
          provider: 'rest'
        }

        project1Permission4 = (await app.service('project-permission').create(
          {
            projectId: project1.id,
            userId: user4.id,
            type: 'owner'
          },
          params
        )) as ProjectPermissionInterface

        const permissions = await app.service('project-permission').Model.findAll({
          where: {
            projectId: project1.id
          }
        })
        assert.ok(project1Permission4)
        assert.strictEqual(project1Permission4.userId, user4.id)
        assert.strictEqual(project1Permission4.projectId, project1.id)
        assert.strictEqual(project1Permission4.type, 'owner')
      })
    })

    describe('patch', () => {
      it('should only update the type when patching a project-permission', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }
        const update = await app.service('project-permission').patch(
          project1Permission2.id,
          {
            projectId: project1.id,
            userId: 'abcdefg',
            type: 'owner'
          },
          params
        )
        assert.strictEqual(update.type, 'owner')
        assert.strictEqual(update.userId, user2.id)
      })

      it('should allow an admin user to patch permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user4.apiKey.token}`
          },
          provider: 'rest'
        }

        const update = await app.service('project-permission').patch(
          project1Permission2.id,
          {
            projectId: project1.id,
            userId: user2.id,
            type: 'user'
          },
          params
        )
        assert.strictEqual(update.type, 'user')
        assert.strictEqual(update.userId, user2.id)
      })

      it('should not allow a user who does not have owner permission on a project to patch permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }

        assert.rejects(
          async () => {
            await app.service('project-permission').patch(
              project1Permission2.id,
              {
                projectId: project1.id,
                userId: user3.id
              },
              params
            )
          },
          { message: 'You are not an owner of this project' }
        )
      })

      it('should not allow a user with no permission on a project to patch permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user3.apiKey.token}`
          },
          provider: 'rest'
        }

        const permissions = await app.service('project-permission').Model.findAll({
          where: {
            projectId: project1.id
          }
        })
        assert.rejects(
          async () => {
            await app.service('project-permission').patch(
              project1Permission2.id,
              {
                projectId: project1.id,
                userId: user3.id
              },
              params
            )
          },
          { message: 'You are not an owner of this project' }
        )
      })
    })

    describe('remove', () => {
      it('should not allow a user who does not have owner permission on a project to remove permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user2.apiKey.token}`
          },
          provider: 'rest'
        }

        assert.rejects(
          async () => {
            await app.service('project-permission').remove(project1Permission2.id, params)
          },
          { message: 'You are not an owner of this project' }
        )
      })

      it('should not allow a user with no permission on a project to remove permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user3.apiKey.token}`
          },
          provider: 'rest'
        }

        assert.rejects(
          async () => {
            await app.service('project-permission').remove(project1Permission2.id, params)
          },
          { message: 'You are not an owner of this project' }
        )
      })

      it('should allow an owner to remove permissions for that project, and if the last owner permission is removed, a user permission should be made the owner', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }

        await app.service('project-permission').remove(project1Permission4.id, params)
        const permissions = (await app.service('project-permission').find({
          query: {
            projectId: project1.id
          },
          ...params
        })) as Paginated<ProjectPermissionInterface>
        assert.strictEqual(permissions.total, 2)
      })

      it('should upgrade a user permission to owner if the last owner permission is deleted', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user1.apiKey.token}`
          },
          provider: 'rest'
        }

        await app.service('project-permission').remove(project1Permission1.id, params)
        const permissions = await app.service('project-permission').Model.findAll({
          where: {
            projectId: project1.id
          }
        })
        assert.strictEqual(permissions.length, 1)
        assert.strictEqual(permissions[0].id, project1Permission2.id)
        assert.strictEqual(permissions[0].type, 'owner')
      })

      it('should allow an admin user to remove permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${user4.apiKey.token}`
          },
          provider: 'rest'
        }

        await app.service('project-permission').remove(project1Permission2.id, params)
        const permissions = (await app.service('project-permission').find({
          query: {
            projectId: project1.id
          },
          ...params
        })) as Paginated<ProjectPermissionInterface>
        assert.strictEqual(permissions.total, 0)
      })
    })

    after(async () => {
      await cleanup(app)
    })
  })
})
