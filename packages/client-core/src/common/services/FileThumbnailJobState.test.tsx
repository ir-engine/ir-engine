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
