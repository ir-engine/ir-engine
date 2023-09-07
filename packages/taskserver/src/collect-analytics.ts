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

import { analyticsPath } from '@etherealengine/engine/src/schemas/analytics/analytics.schema'
import { instanceAttendancePath } from '@etherealengine/engine/src/schemas/networking/instance-attendance.schema'
import { channelPath, ChannelType } from '@etherealengine/engine/src/schemas/social/channel.schema'
import { locationPath, LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import config from '@etherealengine/server-core/src/appconfig'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'
import { Knex } from 'knex'

const logger = multiLogger.child({ component: 'taskserver:collect-analytics' })

const DEFAULT_INTERVAL_SECONDS = 1800
const configInterval = parseInt(config.taskserver.processInterval)
const interval = (configInterval || DEFAULT_INTERVAL_SECONDS) * 1000

export default (app): void => {
  setInterval(async () => {
    logger.info('Collecting analytics at %s.', new Date().toString())
    const activeLocations: any[] = []
    const activeScenes: any[] = []
    const activeChannels = (await app.service(channelPath)._find({
      paginate: false,
      isInternal: true
    })) as ChannelType[]

    const knexClient: Knex = app.get('knexClient')

    const instanceUsers = await knexClient
      .from(userPath)
      .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, `${userPath}.id`)
      .where(`${instanceAttendancePath}.ended`, false)
      .andWhere(`${instanceAttendancePath}.isChannel`, false)
      .select()
      .options({ nestTables: true })

    const channelUsers = await knexClient
      .from(userPath)
      .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, `${userPath}.id`)
      .where(`${instanceAttendancePath}.ended`, false)
      .andWhere(`${instanceAttendancePath}.isChannel`, true)
      .select()
      .options({ nestTables: true })

    const activeInstances = await app.service('instance').find({
      query: {
        ended: {
          $ne: 1
        }
      },
      isInternal: true
    })

    // TODO: Move following to instance.resolvers once instance service is migrated to feathers 5.
    const locations = (await app.service(locationPath).find({
      query: {
        id: {
          $in: activeInstances.data.map((instance) => instance.locationId)
        }
      },
      paginate: false
    })) as LocationType[]

    for (const instance of activeInstances.data) {
      const location = locations.find((location) => location.id === instance.locationId)
      instance.location = location

      if (instance.location) {
        if (activeLocations.indexOf(instance.location.id) < 0) activeLocations.push(instance.location.id)
        if (activeScenes.indexOf(instance.location.sceneId) < 0) activeScenes.push(instance.location.sceneId)
      }
    }

    await Promise.all([
      app.service(analyticsPath).create({
        type: 'activeChannels',
        count: activeChannels.length
      }),
      app.service(analyticsPath).create({
        type: 'instanceUsers',
        count: instanceUsers.length
      }),
      app.service(analyticsPath).create({
        type: 'channelUsers',
        count: channelUsers.length
      }),
      app.service(analyticsPath).create({
        type: 'activeLocations',
        count: activeLocations.length
      }),
      app.service(analyticsPath).create({
        type: 'activeScenes',
        count: activeScenes.length
      }),
      app.service(analyticsPath).create({
        type: 'activeInstances',
        count: activeInstances.total
      })
    ])
  }, interval)
}
