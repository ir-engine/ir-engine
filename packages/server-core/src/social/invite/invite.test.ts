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

import { Application } from '../../../declarations'

let invites: any = []
let user: any = null

describe('invite service', () => {
  let app: Application

  // before(async () => {
  //   app = createFeathersKoaApp()
  //   await app.setup()
  //
  //   await app.service('invite').hooks({
  //     before: {
  //       find: []
  //     }
  //   })
  //
  //   // Create test user
  //   const type = 'password'
  //   const token = `${v1()}@etherealengine.io`
  //   const password = 'test@123'
  //
  //   user = await app.service('identity-provider').create(
  //     {
  //       type,
  //       token,
  //       password
  //     },
  //     {}
  //   )
  // })
  //
  // after(async () => {
  //   // Remove test user
  //   await app.service('identity-provider').remove(null, {
  //     query: {
  //       userId: user.userId
  //     }
  //   })
  // })
  //
  // it('registered the service', async () => {
  //   const service = await app.service('invite')
  //   assert.ok(service, 'Registered the service')
  // })
  //
  // it('should create an invite with friend', async () => {
  //   const inviteType = 'friend'
  //   const token = `${v1()}@etherealengine.io`
  //   const identityProviderType = 'email'
  //
  //   const item = (await app.service('invite').create({
  //     inviteType,
  //     token,
  //     targetObjectId: user.userId,
  //     identityProviderType,
  //     inviteeId: null!
  //   })) as InviteDataType
  //   invites.push(item)
  //
  //   assert.equal(item.inviteType, inviteType)
  //   assert.equal(item.token, token)
  //   assert.equal(item.targetObjectId, user.userId)
  //   assert.equal(item.identityProviderType, identityProviderType)
  //   assert.ok(item.id)
  //   assert.ok(item.passcode)
  // })
  //
  // it('should create an invite with group', async () => {
  //   const inviteType = 'group'
  //   const token = `${v1()}@etherealengine.io`
  //   const identityProviderType = 'email'
  //
  //   const item = (await app.service('invite').create({
  //     inviteType,
  //     token,
  //     targetObjectId: user.userId,
  //     identityProviderType,
  //     inviteeId: null!
  //   })) as InviteDataType
  //   invites.push(item)
  //
  //   assert.equal(item.inviteType, inviteType)
  //   assert.equal(item.token, token)
  //   assert.equal(item.targetObjectId, user.userId)
  //   assert.equal(item.identityProviderType, identityProviderType)
  //   assert.ok(item.id)
  //   assert.ok(item.passcode)
  // })
  //
  // it('should create an invite with party', async () => {
  //   const inviteType = 'party'
  //   const token = `${v1()}@etherealengine.io`
  //   const identityProviderType = 'email'
  //
  //   const item = (await app.service('invite').create({
  //     inviteType,
  //     token,
  //     targetObjectId: user.userId,
  //     identityProviderType,
  //     inviteeId: null!
  //   })) as InviteDataType
  //   invites.push(item)
  //
  //   assert.equal(item.inviteType, inviteType)
  //   assert.equal(item.token, token)
  //   assert.equal(item.targetObjectId, user.userId)
  //   assert.equal(item.identityProviderType, identityProviderType)
  //   assert.ok(item.id)
  //   assert.ok(item.passcode)
  // })
  //
  // // it('should find received invites', async () => {
  // //   const item = await app.service('invite').find({
  // //     query: {
  // //       type: 'received',
  // //       userId: user.userId
  // //     }
  // //   })
  //
  // //   assert.ok(item, 'invite item is found')
  // // })
  //
  // // it('should find sent invites', async () => {
  // //   const item = await app.service('invite').find({
  // //     query: {
  // //       type: 'sent',
  // //       userId: user.userId
  // //     }
  // //   })
  //
  // //   assert.ok(item, 'invite item is found')
  // // })
  //
  // it('should remove invites', async () => {
  //   for (const invite of invites) {
  //     const item = await app.service('invite').remove(invite.id, {})
  //     assert.ok(item, 'invite item is removed')
  //   }
  // })
})
