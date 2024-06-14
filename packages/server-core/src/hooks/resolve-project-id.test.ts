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

import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'

import { destroyEngine } from '@etherealengine/ecs/src/Engine'

import { projectPath } from '@etherealengine/common/src/schema.type.module'
import { deleteFolderRecursive } from '@etherealengine/common/src/utils/fsHelperFunctions'
import appRootPath from 'app-root-path'
import path from 'path'
import { Application } from '../../declarations'
import { createFeathersKoaApp } from '../createApp'
import resolveProjectId from './resolve-project-id'
resolveProjectId

const mockHookContext = (app: Application, query?: Partial<{ project: string }>) => {
  return {
    app,
    params: {
      query
    }
  } as unknown as HookContext<Application>
}

describe('resolve-project-id', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(() => {
    return destroyEngine()
  })

  it('should fail if project name is missing', async () => {
    const resolveProject = resolveProjectId()
    const hookContext = mockHookContext(app)
    assert.rejects(() => resolveProject(hookContext), BadRequest)
  })

  it('should fail if project is not found', async () => {
    const resolveProject = resolveProjectId()
    const hookContext = mockHookContext(app, { project: `Test #${Math.random()}` })
    assert.rejects(() => resolveProject(hookContext), BadRequest)
  })

  it('should find project id by name', async () => {
    const resolveProject = resolveProjectId()
    const project = await app.service(projectPath).create({
      name: `Project #${Math.random()}`
    })
    const hookContext = mockHookContext(app, { project: project.name })
    const contextUpdated = await resolveProject(hookContext)
    assert.equal(contextUpdated.params.query?.projectId, project.id)
    await app.service(projectPath).remove(project.id)
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${project.name}/`)
    deleteFolderRecursive(projectDir)
  })
})
