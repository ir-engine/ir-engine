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

import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Application } from '@ir-engine/server-core/declarations'
import { createFeathersKoaApp } from '@ir-engine/server-core/src/createApp'
import { describe, it } from 'vitest'
import assert from 'assert'
import {
  createEngineSetting,
  findEngineSetting,
  getEngineSetting,
  patchEngineSetting,
  removeEngineSetting
} from '../../test-utils/setting-test-utils'
import { createUser, createUserApiKey } from '../../test-utils/user-test-utils'

describe.only('engine-setting.test', () => {
  let app: Application

  const key1 = 'MyKey1'
  const value1 = 'abc1'
  const key2 = 'MyKey2'
  const value2 = 'abc2'
  let user: UserType
  let engineSetting: EngineSettingType

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()

    const engineSettingResponse = await createEngineSetting(app, key1, value1, 'private', 'aws')
    engineSetting = engineSettingResponse.engineSetting
    user = engineSettingResponse.user
  })

  afterAll(async () => {
    await app.service(userPath).remove(user.id)
    await destroyEngine()
  })

  it('should create engine-setting', async () => {
    const response = await createEngineSetting(app, key2, value1, 'private', 'aws')
    const _user = response.user
    const _engineSetting = response.engineSetting

    assert.ok(_engineSetting)
    assert.equal(_engineSetting.key, key2)
    assert.equal(_engineSetting.value, value1)
    assert.equal(_engineSetting.type, 'private')
    assert.equal(_engineSetting.category, 'aws')
    assert.equal(_engineSetting.updatedBy, _user.id)
    await app.service(userPath).remove(_user.id)
    await app.service(engineSettingPath).remove(_engineSetting.id)
  })

  it('should get engine-setting', async () => {
    const _engineSetting = await getEngineSetting(app, engineSetting.id)

    assert.ok(_engineSetting)
    assert.equal(_engineSetting.key, key1)
    assert.equal(_engineSetting.key, engineSetting.key)
    assert.equal(_engineSetting.value, value1)
    assert.equal(_engineSetting.value, engineSetting.value)
    assert.equal(_engineSetting.updatedBy, user.id)
    assert.equal(_engineSetting.type, engineSetting.type)
    assert.equal(_engineSetting.category, engineSetting.category)
    assert.equal(_engineSetting.createdAt, engineSetting.createdAt)
    assert.equal(_engineSetting.updatedAt, engineSetting.updatedAt)
  })

  it('should find the engine-setting', async () => {
    const { user: user2 } = await createEngineSetting(app, key1, value2, 'private', 'server')

    const _engineSetting1 = await findEngineSetting(app, { category: 'aws', key: key1 })
    const _engineSetting2 = await findEngineSetting(app, { category: 'server', key: key1 })

    assert.notEqual(_engineSetting1.total, 0)
    assert.equal(_engineSetting1.data[0].key, key1)
    assert.equal(_engineSetting1.data[0].value, value1)
    assert.equal(_engineSetting1.data[0].updatedBy, user.id)
    assert.equal(_engineSetting1.data[0].type, 'private')
    assert.equal(_engineSetting1.data[0].category, 'aws')

    assert.notEqual(_engineSetting2.total, 0)
    assert.equal(_engineSetting2.data[0].key, key1)
    assert.equal(_engineSetting2.data[0].value, value2)
    assert.equal(_engineSetting2.data[0].updatedBy, user2.id)
    assert.equal(_engineSetting2.data[0].type, 'private')
    assert.equal(_engineSetting2.data[0].category, 'server')
    await app.service(userPath).remove(user2.id)
    await app.service(engineSettingPath).remove(_engineSetting2.data[0].id)
  })

  it('should only find public engine-setting for guests', async () => {
    await createEngineSetting(app, key2, value2, 'public', 'aws', user)

    const guestUser = await createUser(app)
    const guestApiKey = await createUserApiKey(app, guestUser)

    const _engineSetting = await findEngineSetting(app, { category: 'aws' }, guestApiKey)

    assert.notEqual(_engineSetting.total, 0)

    const publicSettings = _engineSetting.data.find((item) => item.type === 'public')
    const privateSettings = _engineSetting.data.find((item) => item.type === 'private')

    assert.ok(publicSettings)
    assert.equal(privateSettings, undefined)
    await app.service(userPath).remove(guestUser.id)
    await app.service(engineSettingPath).remove(_engineSetting.data[0].id)
  })

  it('should patch engine-setting by id', async () => {
    const createdResponse = await createEngineSetting(app, key2, value2, 'private', 'aws')
    const _createdEngineSetting = createdResponse.engineSetting

    // Testing patch using id:
    const updatedValue = 'xyz'
    const _patchedEngineSetting = (await patchEngineSetting(
      app,
      updatedValue,
      _createdEngineSetting.id
    )) as EngineSettingType

    assert.ok(_patchedEngineSetting)

    assert.notEqual(_patchedEngineSetting.value, _createdEngineSetting.value)
    assert.equal(_patchedEngineSetting.value, updatedValue)
    await app.service(userPath).remove(createdResponse.user.id)
    await app.service(engineSettingPath).remove(_createdEngineSetting.id)
  })

  it('should patch engine-setting by query', async () => {
    const createdResponse = await createEngineSetting(app, key2, value2, 'private', 'aws')
    const _createdEngineSetting = createdResponse.engineSetting

    // Testing patch using query params:
    const updatedValue = 'rst'
    const patchedResponse = await patchEngineSetting(app, updatedValue, undefined, key2)
    const _patchedEngineSetting = Array.isArray(patchedResponse) ? patchedResponse[0] : patchedResponse

    assert.ok(_patchedEngineSetting)

    assert.notEqual(_patchedEngineSetting.value, _createdEngineSetting.value)
    assert.equal(_patchedEngineSetting.value, updatedValue)
    await app.service(userPath).remove(createdResponse.user.id)
    await app.service(engineSettingPath).remove(_patchedEngineSetting.id)
  })

  it('should remove the engine-setting by id', async () => {
    const createdResponse = await createEngineSetting(app, key2, value2, 'private', 'aws')
    const _createdEngineSetting = createdResponse.engineSetting

    // Testing remove using id:
    const _engineSetting = await removeEngineSetting(app, _createdEngineSetting.id)
    assert.ok(_engineSetting)
    const findResponse = await findEngineSetting(app, { id: _createdEngineSetting.id })
    assert.equal(findResponse.total, 0)
    await app.service(userPath).remove(createdResponse.user.id)
  })

  it('should remove the engine-setting by query', async () => {
    const createdResponse = await createEngineSetting(app, key2, value2, 'private', 'aws')
    const _createdEngineSetting = createdResponse.engineSetting

    // Testing patch using query params:
    const _engineSetting = await removeEngineSetting(app, undefined, { key: key2, category: 'aws' })
    assert.ok(_engineSetting)
    const findResponse = await findEngineSetting(app, { id: _createdEngineSetting.id })
    assert.equal(findResponse.total, 0)
    await app.service(userPath).remove(createdResponse.user.id)
  })
})
