import { Application } from '@feathersjs/feathers'
import {
  ScopeType,
  UserApiKeyType,
  UserName,
  fileBrowserPath,
  projectPath,
  scopePath,
  staticResourcePath,
  userApiKeyPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { FILES_PAGE_LIMIT } from '@ir-engine/editor/src/panels/files/helpers'
import { createFeathersKoaApp, tearDownAPI } from '@ir-engine/server-core/src/createApp'
import assert from 'assert'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { FileThumbnailJobState } from './FileThumbnailJobState'

describe('FileThumbnailJobState', () => {
  let app: Application
  let testUserApiKey: UserApiKeyType
  let testProject

  const getProjectParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
    }
  })

  beforeEach(async () => {
    app = await createFeathersKoaApp()
    await app.setup()

    const name = ('test-project-user-name-' + uuidv4()) as UserName

    const testUser = await app.service(userPath).create({
      name,
      isGuest: false
    })

    await app.service(scopePath).create({ userId: testUser.id, type: 'editor:write' as ScopeType })

    testUserApiKey = await app.service(userApiKeyPath).create({ userId: testUser.id })

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

  describe('useGenerateThumbnails', () => {
    it('should add thumbnail jobs for files without thumbnails', async () => {
      await app.service(fileBrowserPath).create({
        project: testProject.name,
        path: 'assets/testThumbnail.glb'
      })
      await app.service(staticResourcePath).create({
        key: 'projects/ir-engine/default-project/assets/testThumbnail.glb',
        project: testProject.name,
        thumbnailKey: null,
        thumbnailURL: null
      })
      const filesQuery = await app.service(fileBrowserPath).find({
        query: {
          project: testProject.name,
          directory: 'projects/ir-engine/default-project/assets',
          $limit: FILES_PAGE_LIMIT
        }
      })
      FileThumbnailJobState.useGenerateThumbnails(filesQuery.data)
      const resource = await app.service(staticResourcePath).find({
        query: {
          key: 'projects/ir-engine/default-project/assets/testThumbnail.glb'
        }
      })
      assert.ok(resource.data.thumbnailKey !== null, 'generated thumbnail key')
    })
  })

  describe('useGenerateDimensions', () => {
    it('should add dimension jobs for file without dimensions', async () => {
      await app.service(fileBrowserPath).create({
        project: testProject.name,
        path: 'assets/testDimension.glb'
      })
      await app.service(staticResourcePath).create({
        key: 'projects/ir-engine/default-project/assets/testDimension.glb',
        project: testProject.name,
        width: null,
        height: null,
        depth: null
      })
      const filesQuery = await app.service(fileBrowserPath).find({
        query: {
          project: testProject.name,
          directory: 'projects/ir-engine/default-project/assets',
          $limit: FILES_PAGE_LIMIT
        }
      })
      FileThumbnailJobState.useGenerateDimensions(filesQuery.data)
      const resource = await app.service(staticResourcePath).find({
        query: {
          key: 'projects/ir-engine/default-project/assets/testDimension.glb'
        }
      })
      assert.ok(
        resource.data.width !== null && resource.data.height !== null && resource.data.depth !== null,
        'generated dimensions'
      )
    })
  })
})
