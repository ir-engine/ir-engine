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

import assert from 'assert'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { inviteCodeLookupPath } from '@etherealengine/engine/src/schemas/social/invite-code-lookup.schema'
import { UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

let user: UserType

describe('invite-code-lookup service', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    const name = `Test #${Math.random()}`
    const avatarName = 'CyberbotGreen'
    const isGuest = true

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    user = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest,
      scopes: []
    })
  })
  after(() => {
    return destroyEngine()
  })

  it('registered the service', async () => {
    const service = await app.service(inviteCodeLookupPath)
    assert.ok(service, 'Registered the service')
  })

  it('should find user', async () => {
    const inviteCodeLookups = await app.service(inviteCodeLookupPath).find({
      query: {
        inviteCode: user.inviteCode!
      },
      isInternal: true
    })

    assert.ok(inviteCodeLookups, 'user item is found')
  })
})
