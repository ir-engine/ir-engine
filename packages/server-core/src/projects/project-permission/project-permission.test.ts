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
import path from 'path'
import { afterAll, beforeAll, describe, it } from 'vitest'

import {
  projectPermissionPath,
  ProjectPermissionType
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { userApiKeyPath, UserApiKeyType } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { InviteCode, UserID, UserName, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { deleteFolderRecursive } from '@ir-engine/common/src/utils/fsHelperFunctions'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors'
import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

const newProjectName1 = 'testorg/projecttest_test_project_name_1'

const cleanup = async (app: Application) => {
  const project1Dir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName1.split('/')[0]}/`)
  deleteFolderRecursive(project1Dir)
  try {
    await app.service(projectPath).remove(null, { query: { name: newProjectName1 } })
  } catch (e) {
    //
  }
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
  let user1: UserType
  let user2: UserType
  let user3: UserType
  let user4: UserType
  let apiKey1: UserApiKeyType
  let apiKey2: UserApiKeyType
  let apiKey3: UserApiKeyType
  let apiKey4: UserApiKeyType
  let project1, project1Permission1, project1Permission2, project1Permission4
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
    await cleanup(app)

    user1 = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })
    user2 = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })
    user3 = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })
    user4 = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })
    const user1ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user1.id
      }
    })) as Paginated<UserApiKeyType>
    apiKey1 = user1ApiKeys.data[0]
    const user2ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user2.id
      }
    })) as Paginated<UserApiKeyType>
    apiKey2 = user2ApiKeys.data[0]
    const user3ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user3.id
      }
    })) as Paginated<UserApiKeyType>
    apiKey3 = user3ApiKeys.data[0]
    const user4ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user4.id
      }
    })) as Paginated<UserApiKeyType>
    apiKey4 = user4ApiKeys.data[0]
    await app.service(scopePath).create({
      type: 'editor:write' as ScopeType,
      userId: user1.id
    })
    await app.service(scopePath).create({
      type: 'editor:write' as ScopeType,
      userId: user2.id
    })
    await app.service(scopePath).create({
      type: 'editor:write' as ScopeType,
      userId: user3.id
    })
    await app.service(scopePath).create({
      type: 'editor:write' as ScopeType,
      userId: user4.id
    })
    await app.service(scopePath).create({
      type: 'projects:read' as ScopeType,
      userId: user4.id
    })
    await app.service(scopePath).create({
      type: 'projects:write' as ScopeType,
      userId: user4.id
    })
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  describe("'project-permission' service'", () => {
    describe('create', () => {
      it('should add a new project owned by creating user', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey1.token}`
          },
          provider: 'rest'
        }
        project1 = await app.service(projectPath).create(
          {
            name: newProjectName1
          },
          { ...params }
        )
        const projectPermission = (await app.service(projectPermissionPath).find({
          query: {
            projectId: project1.id,
            userId: user1.id
          },
          ...params
        })) as Paginated<ProjectPermissionType>
        project1Permission1 = projectPermission.data[0]
        assert.strictEqual(projectPermission.total, 1)
        assert.strictEqual(project1Permission1.userId, user1.id)
        assert.strictEqual(project1Permission1.projectId, project1.id)
        assert.strictEqual(project1Permission1.type, 'owner')
      })

      it('should create a new project-permission if requested by the owner', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey1.token}`
          },
          provider: 'rest'
        }
        project1Permission2 = await app.service(projectPermissionPath).create(
          {
            projectId: project1.id,
            userId: user2.id,
            type: 'editor'
          },
          params
        )
        assert.ok(project1Permission2)
        assert.strictEqual(project1Permission2.userId, user2.id)
        assert.strictEqual(project1Permission2.projectId, project1.id)
        assert.strictEqual(project1Permission2.type, 'editor')
      })

      it('should return the same project-permission if another create request for a project/user combination is made', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey1.token}`
          },
          provider: 'rest'
        }
        const duplicate = await app.service(projectPermissionPath).create(
          {
            projectId: project1.id,
            userId: user2.id,
            type: 'editor'
          },
          params
        )
        assert.ok(duplicate)
        assert.strictEqual(project1Permission2.id, duplicate.id)
      })

      it('should throw an error if the projectId is invalid', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey1.token}`
          },
          provider: 'rest'
        }

        await assert.rejects(async () => {
          await app.service(projectPermissionPath).create(
            {
              projectId: 'abcdefg',
              userId: user2.id,
              type: 'editor'
            },
            params
          )
        }, new NotFound("No record found for id 'abcdefg'"))
      })

      it('should throw an error if the userId is invalid', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey1.token}`
          },
          provider: 'rest'
        }

        await assert.rejects(async () => {
          await app.service(projectPermissionPath).create(
            {
              projectId: project1.id,
              userId: 'abcdefg' as UserID,
              type: 'editor'
            },
            params
          )
        }, new BadRequest('validation failed'))
      })

      it('should not allow a user who does not have owner permission on a project to create new permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey2.token}`
          },
          provider: 'rest'
        }

        await assert.rejects(
          async () => {
            const res = await app.service(projectPermissionPath).create(
              {
                projectId: project1.id,
                userId: user3.id,
                type: 'editor'
              },
              params
            )
          },
          new Forbidden('Missing required project permission for ' + project1.name)
        )
      })

      it('should not allow a user with no permission on a project to create new permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey3.token}`
          },
          provider: 'rest'
        }

        await assert.rejects(async () => {
          await app.service(projectPermissionPath).create(
            {
              projectId: project1.id,
              userId: user3.id,
              type: 'editor'
            },
            params
          )
        }, new Forbidden('Project permission not found'))
      })

      it('should allow an admin user to create new permissions for a project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey4.token}`
          },
          provider: 'rest'
        }

        project1Permission4 = await app.service(projectPermissionPath).create(
          {
            projectId: project1.id,
            userId: user4.id,
            type: 'owner'
          },
          params
        )

        const permissions = await app.service(projectPermissionPath).find({
          query: {
            projectId: project1.id
          },
          paginate: false
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
            authorization: `Bearer ${apiKey1.token}`
          },
          provider: 'rest'
        }
        const update = (await app.service(projectPermissionPath).patch(
          project1Permission2.id,
          {
            type: 'owner'
          }
          // params
        )) as any as ProjectPermissionType
        assert.strictEqual(update.type, 'owner')
        assert.strictEqual(update.userId, user2.id)
      })

      it('should allow an admin user to patch permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey4.token}`
          },
          provider: 'rest'
        }

        const update = (await app.service(projectPermissionPath).patch(
          project1Permission2.id,
          {
            type: 'editor'
          },
          params
        )) as any as ProjectPermissionType
        assert.strictEqual(update.type, 'editor')
        assert.strictEqual(update.userId, user2.id)
      })

      it('should not allow a user who does not have owner permission on a project to patch permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey2.token}`
          },
          provider: 'rest'
        }

        await assert.rejects(
          async () => {
            await app.service(projectPermissionPath).patch(
              project1Permission2.id,
              {
                type: ''
              },
              params
            )
          },
          new Forbidden('Missing required project permission for ' + project1.name)
        )
      })

      it('should not allow a user with no permission on a project to patch permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey3.token}`
          },
          provider: 'rest'
        }

        const permissions = await app.service(projectPermissionPath).find({
          query: {
            projectId: project1.id
          },
          paginate: false
        })
        await assert.rejects(async () => {
          await app.service(projectPermissionPath).patch(
            project1Permission2.id,
            {
              type: ''
            },
            params
          )
        }, new Forbidden('Project permission not found'))
      })
    })

    describe('remove', () => {
      it('should not allow a user who does not have owner permission on a project to remove permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey2.token}`
          },
          provider: 'rest'
        }

        await assert.rejects(
          async () => {
            await app.service(projectPermissionPath).remove(project1Permission2.id, params)
          },
          new Forbidden('Missing required project permission for ' + project1.name)
        )
      })

      it('should not allow a user with no permission on a project to remove permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey3.token}`
          },
          provider: 'rest'
        }

        await assert.rejects(async () => {
          await app.service(projectPermissionPath).remove(project1Permission2.id, params)
        }, new Forbidden('Project permission not found'))
      })

      it('should allow an owner to remove permissions for that project, and if the last owner permission is removed, a user permission should be made the owner', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey1.token}`
          },
          provider: 'rest'
        }

        await app.service(projectPermissionPath).remove(project1Permission4.id, params)
        const permissions = (await app.service(projectPermissionPath).find({
          query: {
            projectId: project1.id
          },
          ...params
        })) as Paginated<ProjectPermissionType>
        assert.strictEqual(permissions.total, 2)
      })

      it('should upgrade a user permission to owner if the last owner permission is deleted', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey1.token}`
          },
          provider: 'rest'
        }

        await app.service(projectPermissionPath).remove(project1Permission1.id, params)
        const permissions = (await app.service(projectPermissionPath).find({
          query: {
            projectId: project1.id
          },
          paginate: false
        })) as any as ProjectPermissionType[]
        assert.strictEqual(permissions.length, 1)
        assert.strictEqual(permissions[0].id, project1Permission2.id)
        assert.strictEqual(permissions[0].type, 'owner')
      })

      it('should allow an admin user to remove permissions for that project', async function () {
        const params = {
          headers: {
            authorization: `Bearer ${apiKey4.token}`
          },
          provider: 'rest'
        }

        await app.service(projectPermissionPath).remove(project1Permission2.id, params)
        const permissions = (await app.service(projectPermissionPath).find({
          query: {
            projectId: project1.id
          },
          ...params
        })) as Paginated<ProjectPermissionType>
        assert.strictEqual(permissions.total, 0)
      })
    })

    afterAll(async () => {
      await cleanup(app)
    })
  })
})
