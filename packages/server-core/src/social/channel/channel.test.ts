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

import { Channel as ChannelInterface } from '@etherealengine/engine/src/schemas/interfaces/Channel'

import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { ChannelUserType, channelUserPath } from '@etherealengine/engine/src/schemas/social/channel-user.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Paginated } from '@feathersjs/feathers'

describe('channel service', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('registered the service', () => {
    const service = app.service('channel')
    assert.ok(service, 'Registered the service')
  })

  it('creates a channel without userId or instanceId', async () => {
    const channel = await app.service('channel').create({})
    assert.ok(channel.id)
  })

  it('creates and finds channel with userId', async () => {
    const user = await app.service(userPath).create({
      name: 'user',
      isGuest: false,
      avatarId: '',
      inviteCode: '',
      scopes: []
    })

    const channel = await app.service('channel').create(
      {
        userId: user.id
      },
      { user }
    )

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service('channel').find({
      query: {
        channelId: channel.id
      },
      user
    })) as ChannelInterface[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelUserByID = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      }
    })) as Paginated<ChannelUserType>

    assert.ok('total' in channelUserByID, 'find result should contain "total"')
    assert.equal(channelUserByID.data.length, 1)
    assert.equal(channelUserByID.data[0].channelId, channel.id)
    assert.equal(channelUserByID.data[0].userId, user.id)

    const channelUserByUser = (await app.service(channelUserPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserByUser.data.length, 1)
    assert.equal(channelUserByUser.data[0].channelId, channel.id)
    assert.equal(channelUserByUser.data[0].userId, user.id)
  })

  it('can remove and finds channel with instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user',
      isGuest: false,
      avatarId: '',
      inviteCode: '',
      scopes: []
    })

    const instance = (await app.service('instance').create(
      {},
      {
        // @ts-ignore
        isInternal: true
      }
    )) as Instance

    const channel = await app.service('channel').create(
      {
        instanceId: instance.id
      },
      { user }
    )

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service('channel').find({
      query: {
        channelId: channel.id
      },
      user
    })) as ChannelInterface[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelFindAsUser = (await app.service('channel').find({
      query: {
        instanceId: instance.id
      },
      user
    })) as ChannelInterface[]

    assert.equal(channelFindAsUser.length, 1)
    assert.equal(channelFindAsUser[0].id, channel.id)
  })

  it('will not create a channel with both userId and instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user',
      isGuest: false,
      avatarId: '',
      inviteCode: '',
      scopes: []
    })

    const instance = (await app.service('instance').create(
      {},
      {
        // @ts-ignore
        isInternal: true
      }
    )) as Instance

    try {
      await app.service('channel').create(
        {
          instanceId: instance.id,
          userId: user.id
        },
        { user }
      )
    } catch (e) {
      assert.ok(e)
    }
  })

  it('creates and finds channel with instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user',
      isGuest: false,
      avatarId: '',
      inviteCode: '',
      scopes: []
    })

    const instance = (await app.service('instance').create(
      {},
      {
        // @ts-ignore
        isInternal: true
      }
    )) as Instance

    const channel = await app.service('channel').create(
      {
        instanceId: instance.id
      },
      { user }
    )

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service('channel').find({
      query: {
        channelId: channel.id
      },
      user
    })) as ChannelInterface[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelFindAsUser = (await app.service('channel').find({
      query: {
        instanceId: instance.id
      },
      user
    })) as ChannelInterface[]

    assert.equal(channelFindAsUser.length, 1)
    assert.equal(channelFindAsUser[0].id, channel.id)
  })
})
