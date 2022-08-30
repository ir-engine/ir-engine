import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import { ProjectPermissionInterface } from '@xrengine/common/src/interfaces/ProjectPermissionInterface'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'
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
 * - refactor storage provider to be create as part of createFeathersExpressApp() to eliminate global scope
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
    app = createFeathersExpressApp()
    await app.setup()
    await cleanup(app)
    const avatarName = 'CyberbotGreen'

    const avatar = await app.service('avatar').create({
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
    user1.apiKey = await app.service('user-api-key').Model.findOne({
      where: {
        userId: user1.id
      }
    })
    user2.apiKey = await app.service('user-api-key').Model.findOne({
      where: {
        userId: user2.id
      }
    })
    user3.apiKey = await app.service('user-api-key').Model.findOne({
      where: {
        userId: user3.id
      }
    })
    user4.apiKey = await app.service('user-api-key').Model.findOne({
      where: {
        userId: user4.id
      }
    })
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
