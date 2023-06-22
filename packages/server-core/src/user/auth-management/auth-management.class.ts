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

import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import Paginated from '../../types/PageObject'

interface Data {}

interface ServiceOptions {}

/**
 * authManagement class for GET, CREATE, UPDATE AND REMOVE.
 *
 */
export class Authmanagement implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A function which help to find all auth
   *
   * @param params
   * @returns {@Array} all listed auth
   */

  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A function which display specific auth
   *
   * @param id of specific auth
   * @param params
   * @returns {@Object} contain single auth
   */

  async get(id: Id, params?: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }

  /**
   * A function whivh create new auth
   *
   * @param data wich will be used for creating new auth
   * @param params
   */
  async create(data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
  }

  /**
   * A function which update auth
   *
   * @param id
   * @param data for updating auth
   * @param params
   */

  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  /**
   * A function which update auth
   * @param id
   * @param data of updating auth
   * @param params
   * @returns {@Object} data which contains auth
   */

  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  /**
   * A function which remove specific auth
   *
   * @param id of specific auth
   * @param params
   * @returns id
   */
  async remove(id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
