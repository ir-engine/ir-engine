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

import { ProjectType, projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { ProjectSettingType } from '@ir-engine/common/src/schemas/setting/project-setting.schema'
import { UserType, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { deleteFolderRecursive } from '@ir-engine/common/src/utils/fsHelperFunctions'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Application } from '@ir-engine/server-core/declarations'
import { createFeathersKoaApp } from '@ir-engine/server-core/src/createApp'
import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'
import {
  createProject,
  createProjectSetting,
  findProjectSetting,
  patchProjectSetting,
  removeProjectSetting
} from '../../test-utils/project-test-utils'
import { createUser, createUserApiKey } from '../../test-utils/user-test-utils'

function cleanup(name: string) {
  const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/__test/`)
  deleteFolderRecursive(projectDir)
}

describe('project-setting.test', () => {
  let app: Application

  const key1 = 'MyKey1'
  const value1 = 'abc1'
  const key2 = 'MyKey2'
  const value2 = 'abc2'
  let user: UserType
  let project: ProjectType
  let projectSetting: ProjectSettingType

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    const projectResponse = await createProject(app)
    project = projectResponse.project
    user = projectResponse.user

    const projectSettingResponse = await createProjectSetting(app, key1, value1, 'private', user, project)
    projectSetting = projectSettingResponse.projectSetting
  })

  after(async () => {
    await app.service(userPath).remove(user.id)
    await app.service(projectPath).remove(project.id)
    cleanup(project.name)
    await destroyEngine()
  })

  it('should create project-setting', async () => {
    const response = await createProjectSetting(app, key1, value1, 'private')
    const _user = response.user
    const _project = response.project
    const _projectSetting = response.projectSetting

    assert.ok(_projectSetting)
    assert.equal(_projectSetting.key, key1)
    assert.equal(_projectSetting.value, value1)
    assert.equal(_projectSetting.userId, _user.id)
    assert.equal(_projectSetting.projectId, _project.id)
    await app.service(userPath).remove(_user.id)
    await app.service(projectPath).remove(_project.id)
    cleanup(_project.name)
  })

  // it('should get project-setting', async () => {
  //   const _projectSetting = await getProjectSetting(app, projectSetting.id)

  //   assert.ok(_projectSetting)
  //   assert.equal(_projectSetting.key, key1)
  //   assert.equal(_projectSetting.key, projectSetting.key)
  //   assert.equal(_projectSetting.value, value1)
  //   assert.equal(_projectSetting.value, projectSetting.value)
  //   assert.equal(_projectSetting.userId, user.id)
  //   assert.equal(_projectSetting.userId, projectSetting.userId)
  //   assert.equal(_projectSetting.projectId, project.id)
  //   assert.equal(_projectSetting.projectId, projectSetting.projectId)
  //   assert.equal(_projectSetting.createdAt, projectSetting.createdAt)
  //   assert.equal(_projectSetting.updatedAt, projectSetting.updatedAt)
  // })

  it('should find the project-setting', async () => {
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
    await app.service(userPath).remove(user2.id)
    await app.service(projectPath).remove(project2.id)
    cleanup(project2.name)
  })

  it('should only find public project-setting for guests', async () => {
    await createProjectSetting(app, key2, value2, 'public', user, project)

    const guestUser = await createUser(app)
    const guestApiKey = await createUserApiKey(app, guestUser)

    const _projectSetting = await findProjectSetting(app, { projectId: project.id }, guestApiKey)

    assert.notEqual(_projectSetting.total, 0)

    const publicSettings = _projectSetting.data.find((item) => item.type === 'public')
    const privateSettings = _projectSetting.data.find((item) => item.type === 'private')

    assert.ok(publicSettings)
    assert.equal(privateSettings, undefined)
    await app.service(userPath).remove(guestUser.id)
  })

  it('should patch project-setting by id', async () => {
    const createdResponse = await createProjectSetting(app, key2, value2, 'private')
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
    await app.service(userPath).remove(createdResponse.user.id)
    await app.service(projectPath).remove(createdResponse.project.id)
    cleanup(createdResponse.project.name)
  })

  it('should patch project-setting by query', async () => {
    const createdResponse = await createProjectSetting(app, key2, value2, 'private')
    const _createdProject = createdResponse.project
    const _createdProjectSetting = createdResponse.projectSetting

    // Testing patch using query params:
    const updatedValue = 'rst'
    const patchedResponse = await patchProjectSetting(app, updatedValue, undefined, _createdProject.id, key2)
    const _patchedProjectSetting = Array.isArray(patchedResponse) ? patchedResponse[0] : patchedResponse

    assert.ok(_patchedProjectSetting)

    assert.notEqual(_patchedProjectSetting.value, _createdProjectSetting.value)
    assert.equal(_patchedProjectSetting.value, updatedValue)
    await app.service(userPath).remove(createdResponse.user.id)
    await app.service(projectPath).remove(createdResponse.project.id)
    cleanup(createdResponse.project.name)
  })

  it('should remove the project-setting by id', async () => {
    const createdResponse = await createProjectSetting(app, key2, value2, 'private')
    const _createdProjectSetting = createdResponse.projectSetting

    // Testing remove using id:
    const _projectSetting = await removeProjectSetting(app, _createdProjectSetting.id)
    assert.ok(_projectSetting)
    const findResponse = await findProjectSetting(app, { id: _createdProjectSetting.id })
    assert.equal(findResponse.total, 0)
    await app.service(userPath).remove(createdResponse.user.id)
    await app.service(projectPath).remove(createdResponse.project.id)
    cleanup(createdResponse.project.name)
  })

  it('should remove the project-setting by query', async () => {
    const createdResponse = await createProjectSetting(app, key2, value2, 'private')
    const _createdProject = createdResponse.project
    const _createdProjectSetting = createdResponse.projectSetting

    // Testing patch using query params:
    const _projectSetting = await removeProjectSetting(app, undefined, { key: key2, projectId: _createdProject.id })
    assert.ok(_projectSetting)
    const findResponse = await findProjectSetting(app, { id: _createdProjectSetting.id })
    assert.equal(findResponse.total, 0)
    await app.service(userPath).remove(createdResponse.user.id)
    await app.service(projectPath).remove(createdResponse.project.id)
    cleanup(createdResponse.project.name)
  })
})
