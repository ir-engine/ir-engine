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

import { ProjectType } from '@etherealengine/common/src/schemas/projects/project.schema'
import { ProjectSettingType } from '@etherealengine/common/src/schemas/setting/project-setting.schema'
import { UserType } from '@etherealengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { Application } from '@etherealengine/server-core/declarations'
import { createFeathersKoaApp } from '@etherealengine/server-core/src/createApp'
import assert from 'assert'
import {
  createProject,
  createProjectSetting,
  findProjectSetting,
  getProjectSetting,
  patchProjectSetting,
  removeProjectSetting
} from '../../test-utils/project-test-utils'

describe.only('project-setting.test', () => {
  let app: Application

  const key1 = 'MyKey1'
  const value1 = 'abc1'
  const key2 = 'MyKey2'
  const value2 = 'abc2'
  let user: UserType
  let project: ProjectType

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    const response = await createProject(app)
    project = response.project
    user = response.user
  })

  after(() => destroyEngine())

  it('should create project-setting', async () => {
    const response = await createProjectSetting(app, key1, value1, 'private', user, project)
    const _projectSetting = response.projectSetting

    assert.ok(_projectSetting)
    assert.equal(_projectSetting.key, key1)
    assert.equal(_projectSetting.value, value1)
    assert.equal(_projectSetting.userId, user.id)
    assert.equal(_projectSetting.projectId, project.id)
  })

  it('should get project-setting', async () => {
    const createdResponse = await createProjectSetting(app, key1, value1, 'private', user, project)
    const _createdProjectSetting = createdResponse.projectSetting
    const _projectSetting = await getProjectSetting(app, _createdProjectSetting.id)

    assert.ok(_projectSetting)
    assert.equal(_projectSetting.key, key1)
    assert.equal(_projectSetting.key, _createdProjectSetting.key)
    assert.equal(_projectSetting.value, value1)
    assert.equal(_projectSetting.value, _createdProjectSetting.value)
    assert.equal(_projectSetting.userId, user.id)
    assert.equal(_projectSetting.userId, _createdProjectSetting.userId)
    assert.equal(_projectSetting.projectId, project.id)
    assert.equal(_projectSetting.projectId, _createdProjectSetting.projectId)
    assert.equal(_projectSetting.createdAt, _createdProjectSetting.createdAt)
    assert.equal(_projectSetting.updatedAt, _createdProjectSetting.updatedAt)
  })

  it('should find the project-setting', async () => {
    await createProjectSetting(app, key1, value1, 'private', user, project)
    const { user: user2, project: project2 } = await createProjectSetting(app, key1, value2, 'private')

    const _projectSetting1 = await findProjectSetting(app, { projectId: project.id, key: key1 })
    const _projectSetting2 = await findProjectSetting(app, { projectId: project2.id, key: key1 })

    assert.notEqual(_projectSetting1.total, 0)
    assert.equal(_projectSetting1.data[0].key, key1)
    assert.equal(_projectSetting1.data[0].value, value1)
    assert.equal(_projectSetting1.data[0].userId, user.id)
    assert.equal(_projectSetting1.data[0].projectId, project.id)

    assert.notEqual(_projectSetting2.total, 0)
    assert.equal(_projectSetting2.data[0].key, key1)
    assert.equal(_projectSetting2.data[0].value, value2)
    assert.equal(_projectSetting2.data[0].userId, user2.id)
    assert.equal(_projectSetting2.data[0].projectId, project2.id)
  })

  it('should patch project-setting by id', async () => {
    const createdResponse = await createProjectSetting(app, key2, value2, 'private', user, project)
    const _createdProjectSetting = createdResponse.projectSetting

    // Testing patch using id:
    const updatedValue = 'xyz'
    const _patchedProjectSetting = (await patchProjectSetting(
      app,
      updatedValue,
      _createdProjectSetting.id
    )) as ProjectSettingType

    assert.ok(_patchedProjectSetting)

    assert.notEqual(_patchedProjectSetting.value, _createdProjectSetting.value)
    assert.equal(_patchedProjectSetting.value, updatedValue)
  })

  it('should patch project-setting by query', async () => {
    const createdResponse = await createProjectSetting(app, key2, value2, 'private', user, project)
    const _createdProjectSetting = createdResponse.projectSetting

    // Testing patch using query params:
    const updatedValue = 'rst'
    const patchedResponse = await patchProjectSetting(app, updatedValue, undefined, project.id, key2)
    const _patchedProjectSetting = Array.isArray(patchedResponse) ? patchedResponse[0] : patchedResponse

    assert.ok(_patchedProjectSetting)

    assert.notEqual(_patchedProjectSetting.value, _createdProjectSetting.value)
    assert.equal(_patchedProjectSetting.value, updatedValue)
  })

  it('should remove the project-setting by id', async () => {
    const createdResponse = await createProjectSetting(app, key2, value2, 'private', user, project)
    const _createdProjectSetting = createdResponse.projectSetting

    // Testing remove using id:
    const _projectSetting = await removeProjectSetting(app, _createdProjectSetting.id)
    assert.ok(_projectSetting)
    const findResponse = await findProjectSetting(app, { id: _createdProjectSetting.id })
    assert.equal(findResponse.total, 0)
  })

  it('should remove the project-setting by query', async () => {
    const createdResponse = await createProjectSetting(app, key2, value2, 'private', user, project)
    const _createdProjectSetting = createdResponse.projectSetting

    // Testing patch using query params:
    const _projectSetting = await removeProjectSetting(app, undefined, { key: key2, projectId: project.id })
    assert.ok(_projectSetting)
    const findResponse = await findProjectSetting(app, { id: _createdProjectSetting.id })
    assert.equal(findResponse.total, 0)
  })
})
