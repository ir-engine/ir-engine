import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'
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
 * - refactor storage provider to be create as part of createFeathersExpressApp() to eliminate global scope
 * - use this to force a local storage provider and test specific files in the upload folder
 * - add tests for all combinations of state for projects
 *
 * - figure out how to mock git clone functionality (maybe override the function?)
 */

describe('project.test', () => {
  let app: Application
  before(async () => {
    app = createFeathersExpressApp()
    await cleanup(app)
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
