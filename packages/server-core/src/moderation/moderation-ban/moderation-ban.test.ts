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

import { moderationBanPath, ModerationBanType } from '@ir-engine/common/src/schemas/moderation/moderation-ban.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { ABUSE_REASONS } from '@ir-engine/common/src/constants/ModerationConstants'
import { locationPath, LocationType, userPath, UserType } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'
import { createTestLocation } from '../../../tests/util/createTestLocation'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { createAdmin, createUser, createUserApiKey } from '../../test-utils/user-test-utils'

const moderationBans: ModerationBanType[] = []
const params = { isInternal: true } as any

describe('moderation-ban.test', () => {
  let app: Application
  let adminUser: UserType
  let user2: UserType
  let testLocation: LocationType
  let adminUserApiKey: any
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
    adminUser = await createAdmin(app)
    adminUserApiKey = await createUserApiKey(app, adminUser)
    user2 = await createUser(app)
    testLocation = await createTestLocation(app, params)
  })
  afterAll(async () => {
    await app.service(userPath).remove(adminUser.id)
    await app.service(locationPath).remove(testLocation.id)
    await tearDownAPI()
    destroyEngine()
  })

  it('should create a moderation ban entry', async () => {
    const moderationBanData = {
      banned: true,
      banReason: ABUSE_REASONS[0],
      banUserId: user2.id
    } as ModerationBanType

    const moderationBan = await app.service(moderationBanPath).create(moderationBanData, {
      provider: 'external',
      headers: {
        authorization: `Bearer ${adminUserApiKey.token}`
      }
    })
    moderationBans.push(moderationBan)

    assert.ok(moderationBan.id)
    assert.equal(moderationBan.banned, moderationBanData.banned)
    assert.equal(moderationBan.banUserId, moderationBanData.banUserId)
    assert.equal(moderationBan.banReason, moderationBanData.banReason)
  })

  it('should find moderation ban entries', async () => {
    for (const moderationBan of moderationBans) {
      const item = await app.service(moderationBanPath).find({
        query: {
          id: moderationBan.id
        },
        provider: 'external',
        headers: {
          authorization: `Bearer ${adminUserApiKey.token}`
        }
      })

      assert.ok(item, 'moderation ban item is found')
    }
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(moderationBanPath).find({
      provider: 'external',
      headers: {
        authorization: `Bearer ${adminUserApiKey.token}`
      }
    })

    assert.ok('total' in item)
  })

  it('should patch moderation ban entries', async () => {
    for (const moderationBan of moderationBans) {
      await app.service(moderationBanPath).patch(
        moderationBan.id,
        {
          banned: false
        } as ModerationBanType,
        {
          provider: 'external',
          headers: {
            authorization: `Bearer ${adminUserApiKey.token}`
          }
        }
      )
      const { banned } = await app.service(moderationBanPath).get(moderationBan.id)
      assert.equal(banned, false)
    }
  })

  it('should remove moderation ban entries', async () => {
    for (const moderationBan of moderationBans) {
      const item = await app.service(moderationBanPath).remove(moderationBan.id, {
        provider: 'external',
        headers: {
          authorization: `Bearer ${adminUserApiKey.token}`
        }
      })
      assert.ok(item, 'moderation ban item is removed')
    }
  })
})
