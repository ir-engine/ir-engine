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

import type { ServiceInterface } from '@feathersjs/feathers'

import { instanceAttendancePath } from '@etherealengine/engine/src/schemas/networking/instance-attendance.schema'
import { InstanceType, instancePath } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { LocationType, locationPath } from '@etherealengine/engine/src/schemas/social/location.schema'
import { userRelationshipPath } from '@etherealengine/engine/src/schemas/user/user-relationship.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { KnexAdapterParams } from '@feathersjs/knex'
import { Knex } from 'knex'
import { Application } from '../../../declarations'

export interface InstanceFriendsParams extends KnexAdapterParams {}

/**
 * A class for InstanceFriends service
 */

export class InstanceFriendsService implements ServiceInterface<InstanceType, InstanceFriendsParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: InstanceFriendsParams) {
    if (params!.user) throw new Error('User not found')
    try {
      const instances = (await this.app.service(instancePath).find({
        query: {
          ended: false
        },
        paginate: false
      })) as InstanceType[]

      const filteredInstances: InstanceType[] = []
      await Promise.all(
        instances.map(async (instance) => {
          const knexClient: Knex = this.app.get('knexClient')

          const instanceAttendance = await knexClient
            .from(instanceAttendancePath)
            .join(instancePath, `${instanceAttendancePath}.instanceId`, '=', `${instancePath}.id`)
            .join(userPath, `${instanceAttendancePath}.userId`, '=', `${userPath}.id`)
            .join(userRelationshipPath, `${userPath}.id`, '=', `${userRelationshipPath}.userId`)
            .where(`${instanceAttendancePath}.ended`, '=', false)
            .andWhere(`${instanceAttendancePath}.isChannel`, '=', false)
            .andWhere(`${instancePath}.id`, '=', instance.id)
            .andWhere(`${userRelationshipPath}.userRelationshipType`, '=', 'friend')
            .andWhere(`${userRelationshipPath}.relatedUserId`, '=', params!.user!.id)
            .select()
            .options({ nestTables: true })

          if (instanceAttendance.length > 0) {
            filteredInstances.push(instance)
          }
        })
      )

      // TODO: Populating location property here manually. Once instance service is moved to feathers 5. This should be part of its resolver.

      const locationIds = filteredInstances
        .map((instance) => (instance?.locationId ? instance.locationId : undefined))
        .filter((instance) => instance !== undefined) as string[]

      const locations = (await this.app.service(locationPath).find({
        query: {
          id: {
            $in: locationIds
          }
        },
        paginate: false
      })) as LocationType[]

      for (const instance of filteredInstances) {
        if (instance && instance.locationId) {
          instance.location = locations.find((item) => item.id === instance.locationId)!
        }
      }

      return filteredInstances
    } catch (err) {
      console.log(err)
      return []
    }
  }
}
