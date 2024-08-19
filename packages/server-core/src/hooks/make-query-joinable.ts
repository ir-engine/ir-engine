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

import { Application, HookContext } from '../../declarations'

/**
 * A hook to make context.params.query joinable, such that if
 * a column is specified without table name, then table name will
 * be appended to it.
 */
export default (tableName: string) => {
  return async (context: HookContext<Application>) => {
    const allowedDollarProps = ['$and', '$or', '$select', '$sort']

    for (const queryItem in context.params.query) {
      if (queryItem.startsWith('$') && !allowedDollarProps.includes(queryItem)) {
        continue
      }

      // If property name already contains a dot, then it contains table name.
      if (queryItem.includes('.')) {
        return
      }

      if (allowedDollarProps.includes(queryItem)) {
        if (Array.isArray(context.params.query[queryItem])) {
          for (const index in context.params.query[queryItem]) {
            for (const subQueryItem in context.params.query[queryItem][index]) {
              context.params.query[queryItem][index][`${tableName}.${subQueryItem}`] =
                context.params.query[queryItem][index][subQueryItem]
              delete context.params.query[queryItem][index][subQueryItem]
            }
          }
        } else {
          for (const subQueryItem in context.params.query[queryItem]) {
            context.params.query[queryItem][`${tableName}.${subQueryItem}`] =
              context.params.query[queryItem][subQueryItem]
            delete context.params.query[queryItem][subQueryItem]
          }
        }
      } else {
        context.params.query[`${tableName}.${queryItem}`] = context.params.query[queryItem]
        delete context.params.query[queryItem]
      }
    }
  }
}
