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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { ChannelID, channelPath } from '@etherealengine/engine/src/schemas/social/channel.schema'
import {
  InviteDatabaseType,
  InviteQuery,
  InviteType,
  SpawnDetailsType
} from '@etherealengine/engine/src/schemas/social/invite.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'
import { fromDateTimeSql, getDateTimeSql } from '../../util/datetime-sql'

export const inviteDbToSchema = (rawData: InviteDatabaseType): InviteType => {
  let spawnDetails = JSON.parse(rawData.spawnDetails) as SpawnDetailsType

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof spawnDetails === 'string') {
    spawnDetails = JSON.parse(spawnDetails)
  }

  return {
    ...rawData,
    spawnDetails
  }
}

export const inviteResolver = resolve<InviteType, HookContext>({
  createdAt: virtual(async (invite) => fromDateTimeSql(invite.createdAt)),
  updatedAt: virtual(async (invite) => fromDateTimeSql(invite.updatedAt)),
  startTime: virtual(async (invite) => (invite.startTime ? fromDateTimeSql(invite.startTime) : '')),
  endTime: virtual(async (invite) => (invite.endTime ? fromDateTimeSql(invite.endTime) : ''))
})

export const inviteExternalResolver = resolve<InviteType, HookContext>(
  {
    user: virtual(async (invite, context) => {
      if (invite.userId) return await context.app.service(userPath)._get(invite.userId)
    }),

    invitee: virtual(async (invite, context) => {
      if (invite.inviteeId) return await context.app.service(userPath)._get(invite.inviteeId)
    }),
    channelName: virtual(async (invite, context) => {
      if (invite.inviteType === 'channel' && invite.targetObjectId) {
        try {
          const channel = await context.app.service(channelPath).get(invite.targetObjectId as ChannelID)
          return channel.name
        } catch (err) {
          return '<A deleted channel>'
        }
      }
    })
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return inviteDbToSchema(rawData)
    }
  }
)

export const inviteDataResolver = resolve<InviteType, HookContext>(
  {
    id: async () => {
      return v4()
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        spawnDetails: JSON.stringify(rawData.spawnDetails)
      }
    }
  }
)

export const invitePatchResolver = resolve<InviteType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        spawnDetails: JSON.stringify(rawData.spawnDetails)
      }
    }
  }
)

export const inviteQueryResolver = resolve<InviteQuery, HookContext>({})
