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

import '../../server-core/src/patchEngineNode'

import getLocalServerIp from '@ir-engine/server-core/src/util/get-local-server-ip'
import appRootPath from 'app-root-path'
import assert from 'assert'
import { ChildProcess } from 'child_process'
import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { API } from '@ir-engine/common'
import {
  channelPath,
  channelUserPath,
  identityProviderPath,
  instanceAttendancePath,
  InstanceData,
  instancePath,
  locationPath,
  RoomCode,
  staticResourcePath,
  UserID,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { destroyEngine, Engine } from '@ir-engine/ecs/src/Engine'
import { getState, PeerID } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { Application } from '@ir-engine/server-core/declarations'

import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { AuthTask } from '@ir-engine/common/src/world/receiveJoinWorld'
import { EntityUUID, getComponent, UUIDComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import config from '@ir-engine/server-core/src/appconfig'
import { Spark } from 'primus'
import { StartTestFileServer } from '../../server-core/src/createFileServer'
import { onConnection } from '../src/channels'
import { InstanceServerState } from '../src/InstanceServerState'
import { setupSocketFunctions } from '../src/SocketFunctions'
import { start } from '../src/start'

const p2pEnabled = config.instanceserver.p2pEnabled

describe('InstanceLoad', () => {
  beforeAll(async () => {
    config.instanceserver.p2pEnabled = false

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

  afterAll(() => {
    config.instanceserver.p2pEnabled = p2pEnabled
    return destroyEngine()
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

    const userID = createdIdentityProvider.userId
    const user = await app.service(userPath).get(userID)

    const peerID = uuidv4() as PeerID

    const skyStationScene = await app.service(locationPath).find({
      query: {
        slugifiedName: 'sky-station'
      }
    })

    const localIp = await getLocalServerIp()
    console.log('localIp', localIp)

    const instance = await app.service(instancePath).create({
      ipAddress: `${localIp}:3031`,
      locationId: skyStationScene.data[0].id,
      assigned: false,
      assignedAt: toDateTimeSql(new Date()),
      roomCode: '' as RoomCode
    } as InstanceData)

    const query = {
      provider: 'test',
      headers: {},
      socketQuery: {
        peerID,
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

    const scene = await app.service(staticResourcePath).get(skyStationScene.data[0].sceneId)

    const entity = UUIDComponent.getEntityByUUID(scene.id as EntityUUID)
    assert(entity > 0)

    assert.equal(getComponent(entity, GLTFComponent).progress, 100)

    assert.equal(getState(InstanceServerState).instance.id, instance.id)
    assert.equal(NetworkState.worldNetwork.hostUserID, instance.id)

    assert.equal(NetworkState.worldNetwork.ready, true)
    assert.equal(getState(InstanceServerState).ready, true)

    const messages = [] as AuthTask[]
    let dataListenerOff = false
    let onData = (args: { peerID: PeerID; accessToken: string; inviteCode: string | null }) => {}

    const spark = {
      headers: { peerID },
      on: (label: string, cb) => {
        onData = cb
      },
      write: (data) => {
        messages.push(structuredClone(data))
      },
      off: () => {
        dataListenerOff = true
      }
    } as any as Spark

    await setupSocketFunctions(app, spark)

    assert.equal(messages.length, 0)

    await onData({ peerID, accessToken: createdIdentityProvider.accessToken!, inviteCode: null })

    assert.equal(messages.length, 2)
    assert.equal(messages[0].status, 'pending')
    assert.equal(messages[1].status, 'success')
    assert.equal(messages[1].hostPeerID, NetworkState.worldNetwork.hostPeerID)
    assert.equal(messages[1].hostPeerID, Engine.instance.store.peerID)

    const instanceAttendance = await app.service(instanceAttendancePath).find({
      query: {
        userId: user.id,
        instanceId: instance.id,
        peerId: peerID
      }
    })

    assert.equal(instanceAttendance.total, 1)
    assert.equal(messages[1].peerIndex, instanceAttendance.data[0].peerIndex)

    const channel = await app.service(channelPath).find({
      query: {
        instanceId: instance.id,
        $limit: 1
      }
    })

    const channelUser = await app.service(channelUserPath).find({
      query: {
        userId: user.id,
        channelId: channel.data[0].id
      }
    })

    assert.equal(channelUser.total, 1)
  })
})
