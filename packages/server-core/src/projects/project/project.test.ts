import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'

const newProjectName = 'test_project_name'

const params = { isInternal: true }

describe('project.test', () => {
  let app: Application
  before(() => {
    app = createFeathersExpressApp()
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
    })

    describe('remove', () => {
      it('should remove project', async function () {
        const { data } = await app.service('project').get(newProjectName, params)
        await app.service('project').remove(data.id, params)
        const project = await app.service('project').get(newProjectName, params)
        assert.strictEqual(project, null)
      })
    })

    after(() => {
      const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName}/`)
      deleteFolderRecursive(projectDir)
    })
  })
})
