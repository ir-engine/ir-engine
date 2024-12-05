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

import '../../patchEngineNode'

import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { LocationID, LocationType, RoomCode } from '@ir-engine/common/src/schemas/social/location.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { createTestLocation } from '@ir-engine/server-core/tests/util/createTestLocation'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

const params = { isInternal: true } as any

const p2pEnabled = config.instanceserver.p2pEnabled

describe('instance.test', () => {
  let app: Application

  beforeAll(async () => {
    config.instanceserver.p2pEnabled = false

    app = await createFeathersKoaApp()
    await app.setup()

    testLocation = await createTestLocation(app, params)
  }, 60000)

  afterAll(async () => {
    config.instanceserver.p2pEnabled = p2pEnabled
    await tearDownAPI()
    destroyEngine()
  })

  let testLocation: LocationType
  let testInstance: InstanceType

  it('should create a server instance', async () => {
    const instance = (await app.service(instancePath).create({
      locationId: testLocation.id as LocationID,
      ipAddress: '1.2.3.4:1234',
      roomCode: '123456' as RoomCode
    })) as InstanceType

    assert.ok(instance)
    assert.equal(instance.locationId, testLocation.id)
    assert.equal(instance.currentUsers, 1) // server is counted as a user
    assert.equal(instance.ended, false)

    testInstance = instance
  })

  it('should get that instance', async () => {
    const instance = await app.service(instancePath).get(testInstance.id)

    assert.ok(instance)
    assert.ok(instance.roomCode)
    assert.equal(instance.id, testInstance.id)
  })

  it('should find instances for admin', async () => {
    const instances = (await app.service(instancePath).find({
      action: 'admin'
    } as any)) as Paginated<InstanceType>

    assert.equal(instances.total, 1)
    assert.equal(instances.data[0].id, testInstance.id)
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(instancePath).find({
      action: 'admin'
    } as any)

    assert.ok('total' in item)
  })
})
