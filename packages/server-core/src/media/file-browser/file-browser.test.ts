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

import { v4 } from 'uuid'
import '../../patchEngineNode'

import assert from 'assert'
import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from 'vitest'

import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import {
  InviteCode,
  projectPath,
  projectPermissionPath,
  ProjectType,
  staticResourcePath,
  UserName,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import path from 'path/posix'
import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { getStorageProvider } from '../storageprovider/storageprovider'

const PREFIX = 'test'

const getRandomizedName = (name: string, suffix = '', prefix = PREFIX) =>
  `${prefix}-${name}-${(Math.random() + 1).toString(36).substring(7)}${suffix}`

describe('file-browser.test', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    const directories = (await getStorageProvider().listFolderContent('projects/'))
      .map((directory) => directory.key)
      .filter((directory) => directory.startsWith('projects/testorg1/test'))

    try {
      await Promise.all(directories.map((directory) => app.service(fileBrowserPath).remove(directory)))
    } catch (error) {
      console.error('Error while cleaning up test directories:', error)
    }

    await tearDownAPI()
    destroyEngine()
  })

  describe('create', () => {
    let user1, user2, project1, project2

    const testProject1Name = `testorg1/${getRandomizedName('directory')}`
    const testProject2Name = `testorg2/${getRandomizedName('directory')}`

    beforeAll(async () => {
      const name1 = `Test #${Math.random()}` as UserName
      const name2 = `Test #${Math.random()}` as UserName
      const isGuest = true

      user1 = await app.service(userPath).create({
        name: name1,
        isGuest,
        inviteCode: '' as InviteCode
      })

      user2 = await app.service(userPath).create({
        name: name2,
        isGuest,
        inviteCode: '' as InviteCode
      })

      project1 = await app.service(projectPath).create({ name: testProject1Name })
      project2 = await app.service(projectPath).create({ name: testProject2Name })

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user1.id,
        projectId: project1.id,
        type: 'owner',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user1.id,
        projectId: project2.id,
        type: 'owner',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
    })

    afterAll(async () => {
      await app.service(projectPath).remove(project1.id)
      await app.service(projectPath).remove(project2.id)
    })

    it('creates a directory in project 1 as user 1, who has owner permission', async () => {
      const createdDirectory = await app
        .service(fileBrowserPath)
        .create('projects/' + testProject1Name + '/public/test', {
          user: user1
        })
      assert.equal(createdDirectory, true)
      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject1Name), true)
    })

    it('creates a directory in project 2 as user 1, who has owner permission, when using a relative path from project 1', async () => {
      const createdDirectory = await app
        .service(fileBrowserPath)
        .create('projects/' + testProject1Name + '/../../' + testProject2Name + '/public/test', {
          user: user1
        })
      assert.equal(createdDirectory, true)
      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject2Name), true)
    })

    it('creates a directory in project 1 as user 2, who has editor permission', async () => {
      const createdDirectory = await app
        .service(fileBrowserPath)
        .create('projects/' + testProject2Name + '/public/test', {
          user: user2
        })
      assert.equal(createdDirectory, true)
      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject2Name), true)
    })

    it('will not create a directory in project 1 with no user specified', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject1Name + '/public/test', {
            provider: 'external'
          }),
        {
          message: 'Not authenticated',
          name: 'NotAuthenticated'
        }
      )
    })

    it('will not create a directory in project 1 as user 2, who does not have any permissions on that project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject1Name + '/public/test', {
            user: user2
          }),
        {
          message: 'Project permission not found'
        }
      )
    })

    it('will not create a directory in project 1 as user 2, who does not have any permissions on that project, if they try to use a relative path from project 2', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await assert.rejects(
        () =>
          app
            .service(fileBrowserPath)
            .create('projects/' + testProject2Name + '/../../' + testProject1Name + '/public/test', {
              user: user2
            }),
        {
          message: 'Project permission not found'
        }
      )
    })

    it('will not create a directory in project 1 as user 2, who has only reviewer permission', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject1Name + '/public/test', {
            user: user2
          }),
        {
          message: 'Missing required project permission for ' + project1.name
        }
      )
    })

    it('will not create a directory in project 2 as user 2, who has only reviewer permission', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject2Name + '/public/test', {
            user: user2
          }),
        {
          message: 'Missing required project permission for ' + project2.name
        }
      )
    })

    it('will not create a directory in project 1 as user 2, who has only reviewer permission, if they try to use a relative path from project 2', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        () =>
          app
            .service(fileBrowserPath)
            .create('projects/' + testProject2Name + '/../../' + testProject1Name + '/public/test', {
              user: user2
            }),
        {
          message: 'Missing required project permission for ' + project1.name
        }
      )
    })

    it('will not create a directory outside of the public or assets folder if user 1, an owner, attempts to do so', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject1Name + '/public', {
            user: user1
          }),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/public') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject1Name + '/test', {
            user: user1
          }),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/test') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )
    })

    it('will not create a directory outside of the public or assets folder in another project if user 1, an owner, attempts to do so with a relative path', async () => {
      await assert.rejects(
        () =>
          app
            .service(fileBrowserPath)
            .create('projects/' + testProject1Name + '/../../' + testProject2Name + '/public', {
              user: user1
            }),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/public') +
            ' as it does not match the specified project: ' +
            testProject2Name +
            ' or it is not in the public or assets folder'
        }
      )
    })

    it('will throw an error if user1 attempts to create a folder outside of a project', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject1Name + '/../../public', {
            user: user1
          }),
        {
          message: 'Invalid project path: projects/public'
        }
      )
    })

    it('will throw an error if user2 attempts to create a folder outside of a project', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject1Name + '/../../public', {
            user: user2
          }),
        {
          message: 'Invalid project path: projects/public'
        }
      )
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).create('projects/' + testProject2Name + '/../../public', {
            user: user2
          }),
        {
          message: 'Invalid project path: projects/public'
        }
      )
    })
  })

  describe('find', () => {
    const testProjectName = `testorg/${getRandomizedName('directory')}`
    let project: ProjectType
    beforeAll(async () => {
      project = await app.service(projectPath).create({ name: testProjectName })
    })

    afterAll(async () => {
      await app.service(projectPath).remove(project.id)
    })

    it('gets the directory', async () => {
      const foundDirectories = await app
        .service(fileBrowserPath)
        .find({ query: { directory: 'projects/' + testProjectName + '/public/' } })
      assert.equal(foundDirectories.total, 0)
    })

    it('filters entries using $like', async () => {
      const totalEntries = await app.service(fileBrowserPath).find({
        query: {
          directory: 'projects/' + testProjectName + '/public/'
        }
      })

      const filteredEntries = await app.service(fileBrowserPath).find({
        query: {
          key: {
            $like: `%${PREFIX}%`
          },
          directory: 'projects/' + testProjectName + '/public/'
        }
      })
      assert.ok(filteredEntries.data.length === totalEntries.data.length)

      const invalidSubstring = PREFIX + '$' // this substring is not present in any of the entries
      const emptyEntries = await app.service(fileBrowserPath).find({
        query: {
          key: {
            $like: `%${invalidSubstring}%`
          },
          directory: 'projects/' + testProjectName + '/public/'
        }
      })
      assert.ok(emptyEntries.data.length === 0)
    })
  })

  describe('patch', () => {
    let user1, user2, project1, project2, testFile1FullPath, testFile2FullPath
    const testFileFullName = getRandomizedName('file', '.txt')
    const invalidString = '%$#@11234%%^^&&^&)(_)(+!%#%@#%&☼8µ█╚AV♠7~u{3A86♠32≥@╧É╚{'
    const invalidFileFullName = getRandomizedName(invalidString, '.txt')
    const shortFileFullName = 'aa.txt'
    const longFileFullName = getRandomizedName(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '.txt'
    )
    const invalidFileExtensionName = getRandomizedName('file', `.${invalidString}`)
    const shortFileExtensionName = getRandomizedName('file', `.a`)
    const longFileExtensionName = getRandomizedName('file', `.txtxt`)

    const testProject1Name = `testorg1/${getRandomizedName('directory')}`
    const testProject2Name = `testorg2/${getRandomizedName('directory')}`

    beforeAll(async () => {
      const name1 = `Test #${Math.random()}` as UserName
      const name2 = `Test #${Math.random()}` as UserName
      const isGuest = true

      testFile1FullPath = 'projects/' + testProject1Name + '/public/' + testFileFullName
      testFile2FullPath = 'projects/' + testProject2Name + '/public/' + testFileFullName

      user1 = await app.service(userPath).create({
        name: name1,
        isGuest,
        inviteCode: '' as InviteCode
      })

      user2 = await app.service(userPath).create({
        name: name2,
        isGuest,
        inviteCode: '' as InviteCode
      })

      project1 = await app.service(projectPath).create({ name: testProject1Name })
      project2 = await app.service(projectPath).create({ name: testProject2Name })

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user1.id,
        projectId: project1.id,
        type: 'owner',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user1.id,
        projectId: project2.id,
        type: 'owner',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
    })

    afterAll(async () => {
      await app.service(projectPath).remove(project1.id)
      await app.service(projectPath).remove(project2.id)
    })

    const testFileName = testFileFullName.split('.')[0]

    const newData = getRandomizedName('new data')
    const body = Buffer.from(newData, 'utf-8')
    const testFileSize = Buffer.byteLength(body)

    it('creates a file if user1, an owner, does so', async () => {
      const resource = await app.service(fileBrowserPath).patch(
        null,
        {
          project: testProject1Name,
          path: 'public/' + testFileFullName,
          body,
          contentType: 'any'
        },
        {
          user: user1
        }
      )

      assert.equal(resource.key, testFile1FullPath)
    })

    it('will not create a file if the file name has invalid characters', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + invalidFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            invalidFileFullName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )
    })

    it('will not create a file if the file name is too long', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + longFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            longFileFullName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )
    })

    it('will not create a file if the file name is too short', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + shortFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            shortFileFullName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )
    })

    it('will not create a file if the path contains invalid characters', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + invalidString + '/' + testFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid path: ' +
            'projects/' +
            testProject1Name +
            '/public/' +
            invalidString +
            '; directories can only contain alphanumeric characters, dashes, underscores, dots, and @'
        }
      )
    })

    it('will not create a file if the extension contains invalid characters', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + invalidFileExtensionName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            invalidString.toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )
    })

    it('will not create a file if the extension is too long ', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + longFileExtensionName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            longFileExtensionName.split('.')[1].toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )
    })

    it('will not create a file if the extension is too short ', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + shortFileExtensionName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            shortFileExtensionName.split('.')[1].toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )
    })

    it('gets the file', async () => {
      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: 'projects/' + testProject1Name + '/public/' } })
      const foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))

      assert.ok(foundFile)
      assert.equal(foundFile.name, testFileName)
      assert.equal(foundFile.size, testFileSize)
      assert.equal(foundFile.key, testFile1FullPath)
    })

    it('updates a file with new content as user 1, an owner', async () => {
      const newData = getRandomizedName('new data 2 updated')
      const updateResult = await app.service(fileBrowserPath).patch(
        null,
        {
          project: testProject1Name,
          path: 'public/' + testFileFullName,
          body: Buffer.from(newData, 'utf-8'),
          contentType: 'any'
        },
        {
          user: user1
        }
      )
      assert.ok(updateResult)

      const testDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: 'projects/' + testProject1Name + '/public/' } })
      const updatedFile = testDirectoryContents.data.find((file) => file.key.match(testFileName))
      assert.ok(updatedFile)

      const storageProvider = getStorageProvider()
      const fileContent = await storageProvider.getObject(testFile1FullPath)
      assert.equal(fileContent.Body.toString(), newData)
    })

    it('will not create a file in a different project via relative paths if user1, an owner of both, does so', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: '../../' + testProject2Name + '/public/' + testFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/public/' + testFileFullName) +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )
    })

    it('will not create a file in project1 if user2, who does not have any permission on project 1, does so', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + testFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )
    })

    it('will not create a file in project1 if user2, who does not have any permission on project 1, does so via a relative path', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject2Name,
              path: '../../' + testProject1Name + '/public/' + testFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/public/' + testFileFullName) +
            ' as it does not match the specified project: ' +
            testProject2Name +
            ' or it is not in the public or assets folder'
        }
      )
    })

    it('will not create a file in project1 if user2, who is only a reviewer on project 1, does so', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: 'public/' + testFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Missing required project permission for ' + testProject1Name
        }
      )
    })

    it('will not create a file in project1 if user2, who is only a reviewer on project 1, does so via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject2Name,
              path: '../../' + testProject1Name + '/public/' + testFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/public/' + testFileFullName) +
            ' as it does not match the specified project: ' +
            testProject2Name +
            ' or it is not in the public or assets folder'
        }
      )
    })

    it('will not create a file outside of the public or assets folder', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject2Name,
              path: testFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/' + testFileFullName) +
            ' as it does not match the specified project: ' +
            testProject2Name +
            ' or it is not in the public or assets folder'
        }
      )
    })

    it('will not create a file outside of a project', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).patch(
            null,
            {
              project: testProject1Name,
              path: '../../' + testFileFullName,
              body,
              contentType: 'any'
            },
            {
              user: user1
            }
          ),
        {
          message: 'Invalid path: ' + path.join('projects/' + testFileFullName) + '; not in a valid project'
        }
      )
    })
  })

  describe('update', () => {
    const invalidString = '(_)(+!%#%@#%&☼8µ█╚AV♠7~u{3A86♠32≥@╧É╚{'
    const testFileName2 = getRandomizedName('file2', '.md')
    const newData2 = getRandomizedName('new data 2')
    const testFileName3 = getRandomizedName('file3', '.mdx')
    const newData3 = getRandomizedName('new data 3')
    const invalidFileName = getRandomizedName(invalidString, '.txt')
    const shortFileName = 'aa.txt'
    const longFileName = getRandomizedName(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '.txt'
    )
    const invalidFileExtension = getRandomizedName('file4', `.${invalidString}`)
    const shortFileExtension = getRandomizedName('file4', '.a')
    const longFileExtension = getRandomizedName('file4', '.abcdef')

    let user1, user2, project1, project2, testFile1FullPath, testFile2FullPath
    const testFileFullName = getRandomizedName('file', '.txt')

    let testProject1Name
    let testProject2Name

    beforeEach(async () => {
      const name1 = `Test #${Math.random()}` as UserName
      const name2 = `Test #${Math.random()}` as UserName
      const isGuest = true

      testProject1Name = `testorg1/${getRandomizedName('directory')}`
      testProject2Name = `testorg2/${getRandomizedName('directory')}`
      testFile1FullPath = 'projects/' + testProject1Name + '/public/' + testFileFullName
      testFile2FullPath = 'projects/' + testProject2Name + '/public/' + testFileFullName

      user1 = await app.service(userPath).create({
        name: name1,
        isGuest,
        inviteCode: '' as InviteCode
      })

      user2 = await app.service(userPath).create({
        name: name2,
        isGuest,
        inviteCode: '' as InviteCode
      })

      project1 = await app.service(projectPath).create({ name: testProject1Name })
      project2 = await app.service(projectPath).create({ name: testProject2Name })

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user1.id,
        projectId: project1.id,
        type: 'owner',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user1.id,
        projectId: project2.id,
        type: 'owner',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)

      await app.service(fileBrowserPath).patch(
        null,
        {
          project: testProject1Name,
          path: 'public/test/' + testFileName2,
          body: Buffer.from(newData2, 'utf-8'),
          contentType: 'any'
        },
        {
          user: user1
        }
      )

      await app.service(fileBrowserPath).patch(
        null,
        {
          project: testProject1Name,
          path: 'public/test/' + testFileName3,
          body: Buffer.from(newData3, 'utf-8'),
          contentType: 'any'
        },
        {
          user: user1
        }
      )
    })

    afterEach(async () => {
      await app.service(projectPath).remove(project1.id)
      await app.service(projectPath).remove(project2.id)
    })

    it('copies a file within a project when performed by user 1, an owner of the project', async () => {
      const oldPath = 'projects/' + testProject1Name + '/public/test/'
      const newPath = 'projects/' + testProject1Name + '/public/test2/'

      const copyFileResult = await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject1Name,
          oldName: testFileName2,
          newName: testFileName2,
          oldPath,
          newPath,
          isCopy: true
        },
        {
          user: user1
        }
      )

      assert.equal(copyFileResult.length, 1)
      assert(copyFileResult[0].key === newPath + testFileName2)

      const originalResource = await app.service(staticResourcePath).find({
        query: {
          key: oldPath + testFileName2
        }
      })
      assert.ok(originalResource.data.length === 1, 'Original resource not found')

      const copiedResource = await app.service(staticResourcePath).find({
        query: {
          key: newPath + testFileName2
        }
      })
      assert.ok(copiedResource.data.length === 1, 'Copied resource not found')
    })

    it('copies a file between projects when performed by user 1, an owner of both projects', async () => {
      const oldPath = 'projects/' + testProject1Name + '/public/test/'
      const newPath = 'projects/' + testProject2Name + '/public/test/'

      const copyFileResult = await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject2Name,
          oldName: testFileName2,
          newName: testFileName2,
          oldPath,
          newPath,
          isCopy: true
        },
        {
          user: user1
        }
      )

      assert.equal(copyFileResult.length, 1)
      assert(copyFileResult[0].key === newPath + testFileName2)

      const originalResource = await app.service(staticResourcePath).find({
        query: {
          key: oldPath + testFileName2
        }
      })
      assert.ok(originalResource.data.length === 1, 'Original resource not found')

      const copiedResource = await app.service(staticResourcePath).find({
        query: {
          key: newPath + testFileName2
        }
      })
      assert.ok(copiedResource.data.length === 1, 'Copied resource not found')
    })

    it('copies a directory within a project when performed by user 1, an owner of the project', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject1Name,
          oldName: 'public/test/',
          newName: 'public/test2/',
          oldPath: `projects/${testProject1Name}/`,
          newPath: `projects/${testProject1Name}/`,
          isCopy: true
        },
        {
          user: user1
        }
      )

      assert.equal(copyDirectoryResult.length, 2)
      assert(
        copyDirectoryResult.find(
          (file) => file.key === 'projects/' + testProject1Name + '/public/test2/' + testFileName2
        )
      )
      assert(
        copyDirectoryResult.find(
          (file) => file.key === 'projects/' + testProject1Name + '/public/test2/' + testFileName3
        )
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test2', 'projects/' + testProject1Name), true)
      assert(await storageProvider.getObject('projects/' + testProject1Name + '/public/test2/' + testFileName3))

      // copy back
      await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject1Name,
          oldName: 'public/test2/',
          newName: 'public/test/',
          oldPath: `projects/${testProject1Name}/`,
          newPath: `projects/${testProject1Name}/`,
          isCopy: true
        },
        {
          user: user1
        }
      )
    })

    it('copies a directory between projects when performed by user 1, an owner of both projects', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject2Name,
          oldName: 'public/test/',
          newName: 'public/test/',
          oldPath: `projects/${testProject1Name}/`,
          newPath: `projects/${testProject2Name}/`,
          isCopy: true
        },
        {
          user: user1
        }
      )

      assert.equal(copyDirectoryResult.length, 2)
      assert(
        copyDirectoryResult.find(
          (file) => file.key === 'projects/' + testProject2Name + '/public/test/' + testFileName2
        )
      )
      assert(
        copyDirectoryResult.find(
          (file) => file.key === 'projects/' + testProject2Name + '/public/test/' + testFileName3
        )
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject2Name), true)
      assert(await storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))

      // copy back
      await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject2Name,
          newProject: testProject1Name,
          oldName: 'public/test/',
          newName: 'public/test/',
          oldPath: `projects/${testProject2Name}/`,
          newPath: `projects/${testProject1Name}/`,
          isCopy: true
        },
        {
          user: user1
        }
      )
    })

    it('moves a file within the same project when performed by user 1, an owner of the project', async () => {
      const moveFileResult = await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject1Name,
          oldName: testFileName3,
          newName: testFileName3,
          oldPath: 'projects/' + testProject1Name + '/public/test/',
          newPath: 'projects/' + testProject1Name + '/public/test2/'
        },
        {
          user: user1
        }
      )

      assert.equal(moveFileResult.length, 1)
      assert(moveFileResult[0].key === 'projects/' + testProject1Name + '/public/test2/' + testFileName3)

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test2/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
    })

    it('moves a file between projects when performed by user 1, an owner of both projects', async () => {
      const moveFileResult = await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject2Name,
          oldName: testFileName3,
          newName: testFileName3,
          oldPath: 'projects/' + testProject1Name + '/public/test/',
          newPath: 'projects/' + testProject2Name + '/public/test/'
        },
        {
          user: user1
        }
      )

      assert.equal(moveFileResult.length, 1)
      assert(moveFileResult[0].key === 'projects/' + testProject2Name + '/public/test/' + testFileName3)

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
    })

    it('moves a directory when performed by user 1, an owner of both projects', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject2Name,
          oldName: 'public/test/',
          newName: 'public/test/',
          oldPath: 'projects/' + testProject1Name + '/',
          newPath: 'projects/' + testProject2Name + '/'
        },
        {
          user: user1
        }
      )

      assert.equal(copyDirectoryResult.length, 2)
      assert(
        copyDirectoryResult.find(
          (file) => file.key === 'projects/' + testProject2Name + '/public/test/' + testFileName2
        )
      )
      assert(
        copyDirectoryResult.find(
          (file) => file.key === 'projects/' + testProject2Name + '/public/test/' + testFileName3
        )
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject2Name), true)
      assert(await storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName2))
      assert(await storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('increments the file name if file already exists', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(
        null,
        {
          oldProject: testProject1Name,
          newProject: testProject1Name,
          oldName: testFileName2,
          newName: testFileName2,
          oldPath: 'projects/' + testProject1Name + '/public/test/',
          newPath: 'projects/' + testProject1Name + '/public/test/',
          isCopy: true
        },
        {
          user: user1
        }
      )

      assert.equal(copyDirectoryResult.length, 1)

      const fileName = testFileName2.split('.').slice(0, -1).join('.')
      const extension = testFileName2.split('.').pop()!
      const newFileName = `${fileName}(1).${extension}`
      assert(
        copyDirectoryResult.find((file) => file.key === 'projects/' + testProject1Name + '/public/test/' + newFileName)
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject1Name), true)
      assert(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName2))
      assert(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + newFileName))
    })

    it('does not move a file when performed by user 2, who does not have any permissions on the old or new project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject2Name + '/public/test/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who has editor permission on the old project but none on the new project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject2Name + '/public/test/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who has editor permission on the new project but none on the old project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject2Name + '/public/test/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who has only reviewer permissions on the old project and editor on the new project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject2Name + '/public/test/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Missing required project permission for ' + project1.name
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who has only reviewer permissions on the new project and editor on the old project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject2Name + '/public/test/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Missing required project permission for ' + project2.name
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who does not have any permissions on the old or new project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/../../' + testProject2Name + '/public/test'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who has editor permission on the old project but none on the new project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/../../' + testProject2Name + '/public/test'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/public/test/', testFileName3) +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who has editor permission on the new project but none on the old project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/../../' + testProject2Name + '/public/test'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who has only reviewer permissions on the old project and editor on the new project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/../../' + testProject2Name + '/public/test'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Missing required project permission for ' + testProject1Name
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move a file when performed by user 2, who has only reviewer permissions on the new project and editor on the old project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/../../' + testProject2Name + '/public/test'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/public/test/', testFileName3) +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.ok(await storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test/' + testFileName3))
    })

    it('does not move the public or assets directories when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/',
              newName: 'public/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/public/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'assets/',
              newName: 'assets/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/assets/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName3))
    })

    it('does not move a project directory when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: testProject1Name + '/',
              newName: 'public/',
              oldPath: 'projects/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject2Name + '/public/public/test/' + testFileName2)
      )
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject2Name + '/public/public/test/' + testFileName3)
      )
    })

    it('does not move an org directory when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'testorg1/',
              newName: 'public/',
              oldPath: 'projects/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message: 'Invalid path: projects/testorg1/' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject2Name + '/public/public/test/' + testFileName2)
      )
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject2Name + '/public/public/test/' + testFileName3)
      )
    })

    it('does not move the top-level projects directory when performed by user 1, an owner of multiple projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'projects/',
              newName: 'public/',
              oldPath: '',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message: 'Invalid path: projects/' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject(
          'projects/' + testProject2Name + '/public/' + testProject1Name + '/public/test/' + testFileName2
        )
      )
      await assert.rejects(
        storageProvider.getObject(
          'projects/' + testProject2Name + '/public/' + testProject1Name + '/public/test/' + testFileName3
        )
      )
    })

    it('does not move the public or assets directories when performed by user 1, an owner of both projects, via a relative path', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/../',
              newName: 'public/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/public/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'assets/test/../',
              newName: 'assets/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/assets/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName3))
    })

    it('does not move a project directory when performed by user 1, an owner of both projects, via a relative path', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: testProject1Name + '/public/test/../../',
              newName: 'public/',
              oldPath: 'projects/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject2Name + '/public/public/test/' + testFileName2)
      )
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject2Name + '/public/public/test/' + testFileName3)
      )
    })

    it('does not move the top-level projects directory when performed by user 1, an owner of multiple projects, via a relative path', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'projects/' + testProject1Name + '/public/test/../../../../',
              newName: 'public/',
              oldPath: '',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message: 'Invalid path: projects/' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject(
          'projects/' + testProject2Name + '/public/' + testProject1Name + '/public/test/' + testFileName2
        )
      )
      await assert.rejects(
        storageProvider.getObject(
          'projects/' + testProject2Name + '/public/' + testProject1Name + '/public/test/' + testFileName3
        )
      )
    })

    it('does not move a directory higher than projects when performed by user 1, an owner of multiple projects, via a relative path', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'projects/' + testProject1Name + '/public/test/../../../../../',
              newName: 'public/',
              oldPath: '',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message: 'Invalid path: ./' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject(
          'projects/' + testProject2Name + '/public/' + testProject1Name + '/public/test/' + testFileName2
        )
      )
      await assert.rejects(
        storageProvider.getObject(
          'projects/' + testProject2Name + '/public/' + testProject1Name + '/public/test/' + testFileName3
        )
      )
    })

    it('does not move to a public or assets directory when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: 'public/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/public/') +
            ' as it does not match the specified project: ' +
            testProject2Name +
            ' or it is not in the public or assets folder'
        }
      )

      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'assets/test/',
              newName: 'assets/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/assets/') +
            ' as it does not match the specified project: ' +
            testProject2Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName3))
    })

    it('does not move to a non-public or -asset directory when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: 'test/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/test/') +
            ' as it does not match the specified project: ' +
            testProject2Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/test/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/test/' + testFileName3))
    })

    it('does not move to a root project directory when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: testProject2Name + '/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/') +
            ' as it does not match the specified project: ' +
            testProject2Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/' + testFileName3))
    })

    it('does not move to an org directory when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: 'testorg2/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/'
            },
            {
              user: user1
            }
          ),
        {
          message: 'Invalid path: projects/testorg2/' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + 'testorg2' + '/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + 'testorg2' + '/' + testFileName3))
    })

    it('does not move to the projects directory when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: 'projects/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: '/'
            },
            {
              user: user1
            }
          ),
        {
          message: 'Invalid path: /projects/' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testFileName3))
    })

    it('does not move to a directory above projects when performed by user 1, an owner of both projects', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: 'projects/../',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: '/'
            },
            {
              user: user1
            }
          ),
        {
          message: 'Invalid path: /' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testFileName3))
    })

    ///

    it('does not move a directory within a project when performed by user 2, who has no permission on the project', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: 'public/test2/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test2/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test2/' + testFileName3))
    })

    it('does not move a directory within a project when performed by user 2, who only has reviewer permission on the project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: 'public/test2/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Missing required project permission for ' + testProject1Name
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test2/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test2/' + testFileName3))
    })

    it('does not move a directory between projects when performed by user 2, who has editor permission on the old project and no permission on the new project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: 'public/test2/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test2/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test2/' + testFileName3))
    })

    it('does not move a directory between projects when performed by user 2, who has editor permission on the old project and reviewer permission on the new project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)

      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: 'public/test2/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Missing required project permission for ' + testProject2Name
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test2/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test2/' + testFileName3))
    })

    it('does not move a directory between projects when performed by user 2, who has editor permission on the old project and no permission on the new project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })

      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: '../../' + testProject2Name + '/public/test2/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/public/test2/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test2/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test2/' + testFileName3))
    })

    it('does not move a directory between projects when performed by user 2, who has editor permission on the old project and reviewer permission on the new project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)

      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: '../../' + testProject2Name + 'public/test2/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Missing required project permission for ' + testProject2Name
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public/test', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test2/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/test2/' + testFileName3))
    })

    it('does not move the public or assets directories when performed by user 2, who has permissions on neither project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/',
              newName: 'public/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'assets/',
              newName: 'assets/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName3))
    })

    it('does not move to the public or assets directories when performed by user 2, who has editor permissions on the old project but not the new project', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'public/test/',
              newName: 'public/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject2Name,
              oldName: 'assets/test/',
              newName: 'assets/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject2Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName3))
    })

    it('does not move to the public or assets directories when performed by user 2, who has editor permissions on the old project but not the new project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: '../../' + testProject2Name + '/public/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/public/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'assets/test/',
              newName: '../../' + testProject2Name + '/assets/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/assets/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/assets/' + testFileName3))
    })

    it('does not move to the project directory when performed by user 2, who has editor permissions on the old project but not the new project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: '../../' + testProject2Name + '/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject2Name + '/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
    })

    it('does not move to the org directory when performed by user 2, who has editor permissions on the old project but not the new project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: '../../testorg2/',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Invalid path: projects/testorg2/' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
    })

    it('does not move to the top-level projects directory when performed by user 2, who has editor permissions on the old project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: '../../',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Invalid path: projects/' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
    })

    it('does not move above the projects directory when performed by user 2, who has editor permissions on the old project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: '../../../',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Invalid path: ./' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
    })

    it('does not move to another top-level directory when performed by user 2, who has editor permissions on the old project, via a relative path', async () => {
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project1.id
        }
      })
      await app.service(projectPermissionPath).remove(null, {
        query: {
          userId: user2.id,
          projectId: project2.id
        }
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/',
              newName: '../../../test/test',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user2
            }
          ),
        {
          message: 'Invalid path: test/test' + '; not in a valid project'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
    })

    it('does not copy a directory from a directory with invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test/' + invalidString,
              newName: 'public/test',
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid path: ' +
            'projects/' +
            testProject1Name +
            '/public/test/' +
            invalidString +
            '; directories can only contain alphanumeric characters, dashes, underscores, dots, and @'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(
        await storageProvider.isDirectory(invalidString, 'projects/' + testProject1Name + '/public/test'),
        false
      )
    })

    it('does not copy a directory to a directory with invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: 'public/test',
              newName: invalidString,
              oldPath: 'projects/' + testProject1Name + '/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid path: ' +
            'projects/' +
            testProject1Name +
            '/public/test/' +
            invalidString +
            '; directories can only contain alphanumeric characters, dashes, underscores, dots, and @'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('test', 'projects/' + testProject1Name + '/public'), true)
      assert.equal(
        await storageProvider.isDirectory(invalidString, 'projects/' + testProject1Name + '/public/test'),
        false
      )
    })

    it('does not copy a file from a directory with invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/' + invalidString
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid path: ' +
            'projects/' +
            testProject1Name +
            '/public/test/' +
            invalidString +
            '; directories can only contain alphanumeric characters, dashes, underscores, dots, and @'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName2))
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileName3))
    })

    it('does not copy a file from a directory with invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/' + invalidString,
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid path: ' +
            'projects/' +
            testProject1Name +
            '/public/test/' +
            invalidString +
            '; directories can only contain alphanumeric characters, dashes, underscores, dots, and @'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject(
          'projects/' + testProject1Name + '/public/test/' + invalidString + '/' + testFileName3
        )
      )
    })

    it('does not copy a file to a directory with invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/' + invalidString
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid path: ' +
            'projects/' +
            testProject1Name +
            '/public/test/' +
            invalidString +
            '; directories can only contain alphanumeric characters, dashes, underscores, dots, and @'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject(
          'projects/' + testProject1Name + '/public/test/' + invalidString + '/' + testFileName3
        )
      )
    })

    it('does not copy a file whose name contains invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: invalidFileName,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            invalidFileName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + invalidFileName)
      )
    })

    it('does not copy to a file whose name contains invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: invalidFileName,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            invalidFileName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + invalidFileName)
      )
    })

    it('does not copy from a file whose name is too short', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: shortFileName,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            shortFileName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + shortFileName))
    })

    it('does not copy to a file whose name is too short', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: shortFileName,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            shortFileName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + shortFileName))
    })

    it('does not copy from a file whose name is too long', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: longFileName,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            longFileName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + longFileName))
    })

    it('does not copy to a file whose name is too long', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: longFileName,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file name: ' +
            longFileName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + longFileName))
    })

    it('does not copy from a file whose extension contains invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: invalidFileExtension,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            invalidFileExtension.split('.')[1] +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + invalidFileExtension)
      )
    })

    it('does not copy to a file whose extension contains invalid characters', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: invalidFileExtension,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            invalidFileExtension.split('.')[1] +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + invalidFileExtension)
      )
    })

    it('does not copy from a file whose extension is too short', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: shortFileExtension,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            shortFileExtension.split('.')[1].toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + shortFileExtension)
      )
    })

    it('does not copy to a file whose extension is too short', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: shortFileExtension,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            shortFileExtension.split('.')[1].toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + shortFileExtension)
      )
    })

    it('does not copy from a file whose extension is too long', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: longFileExtension,
              newName: testFileName3,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            longFileExtension.split('.')[1].toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + longFileExtension)
      )
    })

    it('does not copy to a file whose extension is too long', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).update(
            null,
            {
              oldProject: testProject1Name,
              newProject: testProject1Name,
              oldName: testFileName3,
              newName: longFileExtension,
              oldPath: 'projects/' + testProject1Name + '/public/test/',
              newPath: 'projects/' + testProject1Name + '/public/test/'
            },
            {
              user: user1
            }
          ),
        {
          message:
            'Invalid file extension: ' +
            longFileExtension.split('.')[1].toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )

      const storageProvider = getStorageProvider()
      assert.equal(await storageProvider.isDirectory('public', 'projects/' + testProject1Name), true)
      await assert.rejects(
        storageProvider.getObject('projects/' + testProject1Name + '/public/test/' + longFileExtension)
      )
    })
  })

  describe('remove', () => {
    const testProject1Name = `testorg1/${getRandomizedName('directory')}`
    const testProject2Name = `testorg2/${getRandomizedName('directory')}`
    const testFileFullName = getRandomizedName('file', '.txt')
    let project1, project2: ProjectType
    let user1, user2
    const invalidString = '%$#@11234%%^^&&^&)(_)(+!%#%@#%&☼8µ█╚AV♠7~u{3A86♠32≥@╧É╚{'
    const invalidFileName = getRandomizedName(invalidString, '.txt')
    const shortFileName = 'aa.txt'
    const longFileName = getRandomizedName(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '.txt'
    )
    const invalidFileExtension = getRandomizedName('file4', `.${invalidString}`)
    const shortFileExtension = getRandomizedName('file4', '.a')
    const longFileExtension = getRandomizedName('file4', '.abcdef')

    beforeEach(async () => {
      project1 = await app.service(projectPath).create({ name: testProject1Name })
      project2 = await app.service(projectPath).create({ name: testProject2Name })
      const name1 = `Test #${Math.random()}` as UserName
      const name2 = `Test #${Math.random()}` as UserName
      const isGuest = true

      user1 = await app.service(userPath).create({
        name: name1,
        isGuest,
        inviteCode: '' as InviteCode
      })

      user2 = await app.service(userPath).create({
        name: name2,
        isGuest,
        inviteCode: '' as InviteCode
      })
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user1.id,
        projectId: project1.id,
        type: 'owner',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user1.id,
        projectId: project2.id,
        type: 'owner',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(fileBrowserPath).create('projects/' + testProject1Name + '/public/test/', {
        user: user1
      })
      await app.service(fileBrowserPath).patch(
        null,
        {
          project: testProject1Name,
          path: 'public/' + testFileFullName,
          body: Buffer.from(''),
          contentType: 'any'
        },
        {
          user: user1
        }
      )
      await app.service(fileBrowserPath).patch(
        null,
        {
          project: testProject1Name,
          path: 'public/test/' + testFileFullName,
          body: Buffer.from(''),
          contentType: 'any'
        },
        {
          user: user1
        }
      )
      await app.service(fileBrowserPath).patch(
        null,
        {
          project: testProject2Name,
          path: 'public/' + testFileFullName,
          body: Buffer.from(''),
          contentType: 'any'
        },
        {
          user: user1
        }
      )
    })

    afterEach(async () => {
      await app.service(projectPath).remove(project1.id)
      await app.service(projectPath).remove(project2.id)
    })

    it('removes a file when performed by user1, who has owner permission', async () => {
      const removeResult = await app
        .service(fileBrowserPath)
        .remove('projects/' + testProject1Name + '/public/' + testFileFullName, {
          user: user1
        })
      assert.ok(removeResult)

      const storageProvider = getStorageProvider()
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('removes a directory when performed by user1, who has owner permission', async () => {
      const removeResult = await app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/test/', {
        user: user1
      })
      assert.ok(removeResult)

      const storageProvider = getStorageProvider()
      await assert.rejects(storageProvider.getObject('projects/' + testProject1Name + '/public/test/'))
    })

    it('does not remove the public or assets directories when performed by user1, who has owner permission', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/', {
            user: user1
          }),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/public/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/assets/', {
            user: user1
          }),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/assets/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does not remove the project directory when performed by user1, who has owner permission', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/', {
            user: user1
          }),
        {
          message:
            'Not allowed to access this directory or file: ' +
            path.join('projects/' + testProject1Name + '/') +
            ' as it does not match the specified project: ' +
            testProject1Name +
            ' or it is not in the public or assets folder'
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does not remove the org directory when performed by user1, who has owner permission', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).remove('projects/testorg1/', {
            user: user1
          }),
        {
          message: 'Invalid project path: projects/testorg1/'
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does not remove the projects directory when performed by user1, who has owner permission', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).remove('projects/', {
            user: user1
          }),
        {
          message: 'Invalid project path: projects/'
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does not remove a directory above the projects directory when performed by user1, who has owner permission', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).remove('/', {
            user: user1
          }),
        {
          message: 'Not allowed to access directory "/"'
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does not remove a directory above the projects directory when performed by user1, who has owner permission', async () => {
      await assert.rejects(
        async () =>
          app.service(fileBrowserPath).remove('./test/', {
            user: user1
          }),
        {
          message: 'Not allowed to access directory "test/"'
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does remove a file in a different project via relative paths when performed by user1, who has owner permissions on both projects', async () => {
      await assert.ok(
        await app
          .service(fileBrowserPath)
          .remove('projects/' + testProject1Name + '/../../' + testProject2Name + '/public/' + testFileFullName, {
            user: user1
          })
      )

      const storageProvider = getStorageProvider()
      await assert.rejects(storageProvider.getObject('projects/' + testProject2Name + '/public/' + testFileFullName))
    })

    it('does not remove a file in a project when performed by user2, who has no permissions on that project', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/' + testFileFullName, {
            user: user2
          }),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does not remove a file in a project when performed by user2, who has only reviewer permissions on that project', async () => {
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/' + testFileFullName, {
            user: user2
          }),
        {
          message: 'Missing required project permission for ' + testProject1Name
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does not remove a file in another project via relative paths when performed by user2, who has editor permission on the initial project but none on the final project', async () => {
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        () =>
          app
            .service(fileBrowserPath)
            .remove('projects/' + testProject1Name + '/../../' + testProject2Name + '/public/' + testFileFullName, {
              user: user2
            }),
        {
          message: 'Project permission not found'
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('does not remove a file in another project via relative paths when performed by user2, who has editor permission on the initial project and reviewer permission on the final project', async () => {
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project1.id,
        type: 'editor',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await app.service(projectPermissionPath)._create({
        id: v4(),
        userId: user2.id,
        projectId: project2.id,
        type: 'reviewer',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      } as any)
      await assert.rejects(
        () =>
          app
            .service(fileBrowserPath)
            .remove('projects/' + testProject1Name + '/../../' + testProject2Name + '/public/' + testFileFullName, {
              user: user2
            }),
        {
          message: 'Missing required project permission for ' + testProject2Name
        }
      )

      const storageProvider = getStorageProvider()
      await assert.ok(storageProvider.getObject('projects/' + testProject1Name + '/public/' + testFileFullName))
    })

    it('throws an error if the directory has invalid characters', async () => {
      await assert.rejects(
        () =>
          app
            .service(fileBrowserPath)
            .remove('projects/' + testProject1Name + '/public/test/' + invalidString + '/' + testFileFullName, {
              user: user1
            }),
        {
          message: 'URI malformed'
        }
      )
    })

    it('throws an error if the file name has invalid characters', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/test/' + invalidFileName, {
            user: user1
          }),
        {
          message: 'URI malformed'
        }
      )
    })

    it('throws an error if the file extension has invalid characters', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/test/' + invalidFileExtension, {
            user: user1
          }),
        {
          message: 'URI malformed'
        }
      )
    })

    it('throws an error if the file name is too short', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/test/' + shortFileName, {
            user: user1
          }),
        {
          message:
            'Invalid file name: ' +
            shortFileName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )
    })

    it('throws an error if the file name is too long', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/test/' + longFileName, {
            user: user1
          }),
        {
          message:
            'Invalid file name: ' +
            longFileName.split('.')[0] +
            '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
        }
      )
    })

    it('throws an error if the file extension is too short', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/test/' + shortFileExtension, {
            user: user1
          }),
        {
          message:
            'Invalid file extension: ' +
            shortFileExtension.split('.')[1].toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )
    })

    it('throws an error if the file name is too long', async () => {
      await assert.rejects(
        () =>
          app.service(fileBrowserPath).remove('projects/' + testProject1Name + '/public/test/' + longFileExtension, {
            user: user1
          }),
        {
          message:
            'Invalid file extension: ' +
            longFileExtension.split('.')[1].toLowerCase() +
            '; file extension must be 2-4 alphanumeric characters'
        }
      )
    })
  })
})
