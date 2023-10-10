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

import { inviteTypes } from '@etherealengine/engine/src/schemas/social/invite-type.schema'
import { InviteType, invitePath } from '@etherealengine/engine/src/schemas/social/invite.schema'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'
import { v1 } from 'uuid'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

describe('invite.service', () => {
  let app: Application
  let testUser: UserType
  let invites: InviteType[] = []

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  before(async () => {
    const name = 'test-invite-user-name-' + v1()
    const avatarName = 'test-invite-avatar-name-' + v1()

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    testUser = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest: false,
      scopes: []
    })
  })

  inviteTypes.forEach((inviteType) => {
    it(`should create an invite with type ${inviteType}`, async () => {
      const inviteType = 'friend'
      const token = `${v1()}@etherealengine.io`
      const identityProviderType = 'email'

      const createdInvite = await app.service(invitePath).create({
        inviteType,
        token,
        targetObjectId: testUser.id,
        identityProviderType,
        deleteOnUse: true
      })

      invites.push(createdInvite)

      assert.ok(createdInvite.id)
      assert.ok(createdInvite.passcode)
      assert.equal(createdInvite.inviteType, inviteType)
      assert.equal(createdInvite.token, token)
      assert.equal(createdInvite.targetObjectId, testUser.id)
      assert.equal(createdInvite.identityProviderType, identityProviderType)
    })
  })

  it('should find invites with empty search string', async () => {
    const items = await app.service(invitePath).find({ query: { search: '' }, isInternal: true })
    assert.ok(items)
    assert.equal((items as Paginated<InviteType>).data.length, invites.length)
  })

  it('should find invites with search string present', async () => {
    const lastInvite = invites.at(-1)
    const item = await app.service(invitePath).find({ query: { search: lastInvite?.passcode }, isInternal: true })

    assert.equal((item as Paginated<InviteType>).data[0].passcode, lastInvite?.passcode)
  })

  it('should find received invites', async () => {
    const receivedInvites = await app.service(invitePath).find({
      query: {
        type: 'received',
        userId: testUser.id
      },
      isInternal: true
    })

    assert.ok(receivedInvites.data.length > 0)
  })

  it('should find sent invites', async () => {
    const sentInvites = await app.service(invitePath).find({
      query: {
        type: 'sent',
        userId: testUser.id
      },
      isInternal: true
    })

    assert.ok(sentInvites.data.length > 0)
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(invitePath).find({ isInternal: true })

    assert.ok('total' in item)
  })

  it('should remove invites', async () => {
    for (const invite of invites) {
      await app.service(invitePath).remove(invite.id)
      const foundInvites = await app.service(invitePath).find({ query: { id: invite.id }, isInternal: true })
      assert.equal(foundInvites.total, 0)
    }
  })
})
