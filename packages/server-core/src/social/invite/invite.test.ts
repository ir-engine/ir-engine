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

import { InviteType, invitePath } from '@etherealengine/engine/src/schemas/social/invite.schema'
import { identityProviderPath } from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'
import { v1 } from 'uuid'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

let invites: any = []
let user: any = null

describe.skip('invite service', () => {
  let app: Application

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    await app.service(invitePath).hooks({
      before: {
        find: []
      }
    })

    // Create test user
    const type = 'password'
    const token = `${v1()}@etherealengine.io`

    user = await app.service(identityProviderPath).create(
      {
        type,
        token,
        userId: '' as UserID
      },
      {}
    )
  })

  after(async () => {
    // Remove test user
    await app.service(identityProviderPath).remove(null, {
      query: {
        userId: user.userId
      }
    })
  })

  it('registered the service', async () => {
    const service = await app.service(invitePath)
    assert.ok(service, 'Registered the service')
  })

  it('should create an invite with friend', async () => {
    const inviteType = 'friend'
    const token = `${v1()}@etherealengine.io`
    const identityProviderType = 'email'

    const item = (await app.service(invitePath).create({
      inviteType,
      token,
      targetObjectId: user.userId,
      identityProviderType,
      deleteOnUse: true
    })) as InviteType
    invites.push(item)

    assert.equal(item.inviteType, inviteType)
    assert.equal(item.token, token)
    assert.equal(item.targetObjectId, user.userId)
    assert.equal(item.identityProviderType, identityProviderType)
    assert.ok(item.id)
    assert.ok(item.passcode)
  })

  it('should create an invite with group', async () => {
    const inviteType = 'group'
    const token = `${v1()}@etherealengine.io`
    const identityProviderType = 'email'

    const item = (await app.service(invitePath).create({
      inviteType,
      token,
      targetObjectId: user.userId,
      identityProviderType,
      deleteOnUse: true
    })) as InviteType
    invites.push(item)

    assert.equal(item.inviteType, inviteType)
    assert.equal(item.token, token)
    assert.equal(item.targetObjectId, user.userId)
    assert.equal(item.identityProviderType, identityProviderType)
    assert.ok(item.id)
    assert.ok(item.passcode)
  })

  it('should create an invite with party', async () => {
    const inviteType = 'party'
    const token = `${v1()}@etherealengine.io`
    const identityProviderType = 'email'

    const item = (await app.service(invitePath).create({
      inviteType,
      token,
      targetObjectId: user.userId,
      identityProviderType,
      deleteOnUse: true
    })) as InviteType
    invites.push(item)

    assert.equal(item.inviteType, inviteType)
    assert.equal(item.token, token)
    assert.equal(item.targetObjectId, user.userId)
    assert.equal(item.identityProviderType, identityProviderType)
    assert.ok(item.id)
    assert.ok(item.passcode)
  })

  it('should find invites with empty search string', async () => {
    const items = await app.service(invitePath).find({ query: { search: '' } })
    assert.ok(items)
    assert.equal((items as Paginated<InviteType>).data.length, invites.length)
  })

  it('should find invites with search string present', async () => {
    const lastInvite = invites.at(-1)
    const item = await app.service(invitePath).find({ query: { search: invites.passcode } })

    assert.equal((item as Paginated<InviteType>).data[0].passcode, lastInvite.passcode)
  })

  it('should find received invites', async () => {
    const item = await app.service(invitePath).find({
      query: {
        type: 'received',
        userId: user.userId
      }
    })

    assert.ok(item, 'invite item is found')
  })

  it('should find sent invites', async () => {
    const item = await app.service(invitePath).find({
      query: {
        type: 'sent',
        userId: user.userId
      }
    })

    assert.ok(item, 'invite item is found')
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(invitePath).find({})

    assert.ok('total' in item)
  })

  it('should remove invites', async () => {
    for (const invite of invites) {
      const item = await app.service(invitePath).remove(invite.id, {})
      assert.ok(item, 'invite item is removed')
    }
  })
})
