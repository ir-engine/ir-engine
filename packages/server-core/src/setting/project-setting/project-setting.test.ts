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

import {
  AccountProjectType,
  accountProjectPath
} from '@etherealengine/common/src/schemas/setting/account-project.schema'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { Application } from '@etherealengine/server-core/declarations'
import { createFeathersKoaApp } from '@etherealengine/server-core/src/createApp'
import assert from 'assert'
import { createAccountProject, getAccountProject, patchAccountProject } from '../../../tests/testUtils'

describe('account-project.test', () => {
  let app: Application

  let accountProject: AccountProjectType

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    const response = await createAccountProject(app)
    accountProject = response.accountProject
  })

  after(() => destroyEngine())

  it('should get account project details', async () => {
    const _accountProject = await getAccountProject(app, accountProject.id)

    assert.ok(_accountProject)
    assert.equal(_accountProject.id, accountProject.id)
    assert.equal(_accountProject.displayName, accountProject.displayName)
    assert.equal(_accountProject.slug, accountProject.slug)
    assert.equal(_accountProject.projectName, accountProject.projectName)
    assert.equal(_accountProject.projectId, accountProject.projectId)
    assert.equal(_accountProject.accountId, accountProject.accountId)
    assert.equal(_accountProject.userId, accountProject.userId)
    assert.equal(_accountProject.scenes, accountProject.scenes)
    assert.equal(_accountProject.user?.id, accountProject.user?.id)
    assert.equal(_accountProject.createdAt, accountProject.createdAt)
    assert.equal(_accountProject.updatedAt, accountProject.updatedAt)
  })

  it('should find the account project', async () => {
    const foundAccountProjects = await app.service(accountProjectPath).find()
    assert.notEqual(foundAccountProjects.total, 0)
    assert.ok(foundAccountProjects.data.find((d) => d.id === accountProject.id))
  })

  it('should patch account project', async () => {
    const _accountProject = await patchAccountProject(app, accountProject.id, {
      displayName: 'new name'
    })

    assert.ok(_accountProject)

    assert.notEqual(_accountProject.displayName, accountProject.displayName)
    assert.equal(_accountProject.displayName, 'new name')
  })

  it('should remove the account project', async () => {
    await app.service(accountProjectPath).remove(accountProject.id)

    const foundAccountProjects = await app.service(accountProjectPath).find({
      query: {
        id: accountProject.id
      }
    })
    assert.equal(foundAccountProjects.total, 0)
  })
})
