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

import { Id, NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { UserSetting } from '@etherealengine/common/src/interfaces/User'

import { Application } from '../../../declarations'

export type UserSettingsDataType = UserSetting
/**
 * A class for User Settings service
 */
export class UserSettings<T = UserSettingsDataType> extends Service<T> {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const userSettings = (await super.find(params)) as any
    const data = userSettings.data.map((el) => {
      let themeModes = JSON.parse(el.themeModes)

      if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

      return {
        ...el,
        themeModes: themeModes
      }
    })

    return {
      total: userSettings.total,
      limit: userSettings.limit,
      skip: userSettings.skip,
      data
    }
  }

  async get(id: Id, params?: Params): Promise<T> {
    const userSettings = (await super.get(id, params)) as any
    let themeModes = JSON.parse(userSettings.themeModes)

    if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

    return {
      ...userSettings,
      themeModes: themeModes
    }
  }

  async create(data: any, params?: Params): Promise<T | T[]> {
    return super.create(data, params)
  }

  async patch(id: NullableId, data: Partial<T>): Promise<T | T[]> {
    const userSettings = (await super.patch(id, data)) as any

    let themeModes = JSON.parse(userSettings.themeModes)

    if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

    return {
      ...userSettings,
      themeModes: themeModes
    }
  }
}
