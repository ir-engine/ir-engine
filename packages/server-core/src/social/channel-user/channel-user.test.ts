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
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import assert from 'assert'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

import { InstanceType, instancePath } from '@etherealengine/common/src/schemas/networking/instance.schema'
import { ChannelUserType, channelUserPath } from '@etherealengine/common/src/schemas/social/channel-user.schema'
import { channelPath } from '@etherealengine/common/src/schemas/social/channel.schema'
import { RoomCode } from '@etherealengine/common/src/schemas/social/location.schema'
import { AvatarID } from '@etherealengine/common/src/schemas/user/avatar.schema'
import { InviteCode, UserName, userPath } from '@etherealengine/common/src/schemas/user/user.schema'
import { Paginated } from '@feathersjs/feathers'

describe('channel-user service', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('registered the service', () => {
    const service = app.service(channelUserPath)
    assert.ok(service, 'Registered the service')
  })

  it('will remove user from channel if they are the owner', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const channel = await app.service(channelPath).create({}, { user })

    assert.ok(channel.id)

    const channelUser = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUser.data.length, 1)
    assert.equal(channelUser.data[0].channelId, channel.id)
    assert.equal(channelUser.data[0].userId, user.id)
    assert.equal(channelUser.data[0].isOwner, true)

    await app.service(channelUserPath).remove(null, {
      query: {
        channelId: channel.id,
        userId: user.id
      },
      user
    })

    const channelUserAfterRemove = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserAfterRemove.data.length, 0)
  })

  it('will not remove user if they are not the owner', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const user2 = await app.service(userPath).create({
      name: 'user2' as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const instance = (await app.service(instancePath).create(
      {
        roomCode: '' as RoomCode,
        currentUsers: 0
      },
      {
        // @ts-ignore
        isInternal: true
      }
    )) as InstanceType

    const channel = await app.service(channelPath).create(
      {
        instanceId: instance.id
      },
      { user }
    )

    const channelUser2 = await app.service(channelUserPath).create(
      {
        channelId: channel.id,
        userId: user2.id
      },
      { user }
    )

    assert.ok(channel.id)

    const channelUser = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id,
        $sort: { isOwner: -1 }
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUser.data.length, 2)
    assert.equal(channelUser.data[0].channelId, channel.id)
    assert.equal(channelUser.data[0].userId, user.id)
    assert.equal(channelUser.data[0].isOwner, true)
    assert.equal(channelUser.data[1].id, channelUser2.id)
    assert.equal(channelUser.data[1].channelId, channel.id)
    assert.equal(channelUser.data[1].userId, user2.id)
    assert.equal(channelUser.data[1].isOwner, false)

    assert.rejects(() =>
      app.service(channelUserPath).remove(null, {
        query: {
          channelId: channel.id,
          userId: user.id
        },
        user: user2
      })
    )

    const channelUserAfterRemove = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserAfterRemove.data.length, 2)
  })

  it('user can not add themselves to a channel', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const channel = await app.service(channelPath).create({})

    assert.ok(channel.id)

    assert.rejects(() =>
      app.service(channelUserPath).create(
        {
          channelId: channel.id,
          userId: user.id
        },
        {
          user,
          provider: 'rest' // force external to avoid authentication internal escape
        }
      )
    )

    const channelUserAfterRemove = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      },
      user
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserAfterRemove.data.length, 0)
  })
})
