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

import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { inviteCodeLookupPath } from '@ir-engine/common/src/schemas/social/invite-code-lookup.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { UserName, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

let user: UserType

describe('invite-code-lookup service', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()

    const name = `Test #${Math.random()}` as UserName
    const avatarName = 'CyberbotGreen'
    const isGuest = true

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    user = await app.service(userPath).create({
      name,
      isGuest
    })
  })
  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
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
