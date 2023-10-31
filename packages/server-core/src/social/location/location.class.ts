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

import { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import { Knex } from 'knex'

import {
  LocationData,
  LocationDatabaseType,
  LocationPatch,
  locationPath,
  LocationQuery,
  LocationType
} from '@etherealengine/engine/src/schemas/social/location.schema'

import { UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { KnexAdapterParams } from '@feathersjs/knex'

export interface LocationParams extends KnexAdapterParams<LocationQuery> {}

/**
 * A class for Location service
 */

export const locationSettingSorts = ['locationType', 'audioEnabled', 'videoEnabled']

export class LocationService<T = LocationType, ServiceParams extends Params = LocationParams> extends KnexService<
  LocationType,
  LocationData,
  LocationParams,
  LocationPatch
> {
  async makeLobby(trx: Knex.Transaction, selfUser?: UserType) {
    if (!selfUser || !selfUser.scopes || !selfUser.scopes.find((scope) => scope.type === 'admin:admin')) {
      throw new Error('Only Admin can set Lobby')
    }

    await trx.from<LocationDatabaseType>(locationPath).update({ isLobby: false }).where({ isLobby: true })
  }
}
