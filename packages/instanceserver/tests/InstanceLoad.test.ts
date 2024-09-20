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

import getLocalServerIp from '@ir-engine/server-core/src/util/get-local-server-ip'
import appRootPath from 'app-root-path'
import { ChildProcess } from 'child_process'
import { v4 as uuidv4 } from 'uuid'
import { describe, it } from 'vitest'
import assert from 'assert'

import { API } from '@ir-engine/common'
import {
  identityProviderPath,
  InstanceData,
  instancePath,
  locationPath,
  RoomCode,
  UserID
} from '@ir-engine/common/src/schema.type.module'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { getState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { Application } from '@ir-engine/server-core/declarations'

import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { StartTestFileServer } from '../../server-core/src/createFileServer'
import { onConnection } from '../src/channels'
import { InstanceServerState } from '../src/InstanceServerState'
import { start } from '../src/start'

describe('InstanceLoad', () => {
  beforeAll(async () => {
    const child: ChildProcess = require('child_process').spawn('npm', ['run', 'dev-agones'], {
      cwd: appRootPath.path,
      stdio: 'inherit',
      detached: true
    })

    process.on('exit', async () => {
      process.kill(-child.pid!, 'SIGINT')
    })

    const app = await start()
    await app.setup()
    StartTestFileServer()
  })

  it('should load location', async () => {
    const app = API.instance as Application
    const loadLocation = onConnection(app)

    const type = 'guest'
    const token = uuidv4()

    const createdIdentityProvider = await app.service(identityProviderPath).create({
      type,
      token,
      userId: '' as UserID
    })

    const skyStationScene = await app.service(locationPath).find({
      query: {
        slugifiedName: 'sky-station'
      }
    })

    const localIp = await getLocalServerIp()
    console.log('localIp', localIp)
    await app.service(instancePath).create({
      ipAddress: `${localIp}:3031`,
      currentUsers: 0,
      locationId: skyStationScene.data[0].id,
      assigned: false,
      assignedAt: toDateTimeSql(new Date()),
      roomCode: '' as RoomCode
    } as InstanceData)

    const query = {
      provider: 'test',
      headers: {},
      socketQuery: {
        token: createdIdentityProvider.accessToken,
        locationId: skyStationScene.data[0].id,
        instanceID: '',
        channelId: '',
        roomCode: '',
        address: '',
        port: 0,
        EIO: '',
        transport: '',
        t: ''
      },
      instanceId: '',
      channelId: undefined
    } as any

    await loadLocation(query)

    assert.equal(NetworkState.worldNetwork.ready, true)
    assert.equal(getState(InstanceServerState).ready, true)
  })

  afterAll(() => {
    return destroyEngine()
  })
})
