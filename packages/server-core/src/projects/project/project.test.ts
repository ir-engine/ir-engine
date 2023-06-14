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

import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'

const newProjectName = 'ProjectTest_test_project_name'

const params = { isInternal: true } as any

const cleanup = async (app: Application) => {
  const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName}/`)
  deleteFolderRecursive(projectDir)
  try {
    await app.service('project').Model.destroy({ where: { name: newProjectName } })
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

describe('project.test', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    await cleanup(app)
  })
  after(() => {
    return destroyEngine()
  })

  describe("'project' service'", () => {
    describe('create', () => {
      it('should add new project', async function () {
        await app.service('project').create(
          {
            name: newProjectName
          },
          params
        )
        const { data } = await app.service('project').get(newProjectName, params)
        assert.strictEqual(data.name, newProjectName)
      })

      it('should not add new project with same name as existing project', function () {
        assert.rejects(async () => {
          await app.service('project').create(
            {
              name: newProjectName
            },
            params
          )
        })
      })
    })

    describe('remove', () => {
      it('should remove project', async function () {
        const { data } = await app.service('project').get(newProjectName, params)
        await app.service('project').remove(data.id, params)
        const project = await app.service('project').get(newProjectName, params)
        assert.strictEqual(project, null)
      })
    })

    after(async () => {
      await cleanup(app)
    })
  })
})
