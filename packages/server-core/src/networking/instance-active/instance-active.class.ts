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

import { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import {
  InstanceActiveQuery,
  InstanceActiveType
} from '@ir-engine/common/src/schemas/networking/instance-active.schema'
import { InstanceType, instancePath } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { LocationID, LocationType, locationPath } from '@ir-engine/common/src/schemas/social/location.schema'

import { Application } from '../../../declarations'

export interface InstanceActiveParams extends KnexAdapterParams<InstanceActiveQuery> {}

/**
 * A class for InstanceActive service
 */

export class InstanceActiveService implements ServiceInterface<InstanceActiveType, InstanceActiveParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: InstanceActiveParams) {
    const sceneId = params!.query!.sceneId
    if (!sceneId) return []

    // get all locationIds for sceneId
    const locations = (await this.app.service(locationPath).find({
      query: {
        sceneId
      },
      paginate: false
    })) as any as LocationType[]

    if (locations.length === 0) return []

    const instances = (await this.app.service(instancePath).find({
      query: {
        ended: false,
        locationId: {
          $in: locations.map((location) => location.id as LocationID)
        }
      },
      paginate: false
    })) as InstanceType[]

    // return all active instances for each location
    const instancesData: InstanceActiveType[] = instances
      .filter((a) => !!a)
      .map((instance) => {
        return {
          id: instance.id,
          locationId: instance.locationId,
          currentUsers: instance.currentUsers
        }
      })

    return instancesData
  }
}
