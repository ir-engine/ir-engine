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

import { HookContext } from '../../declarations'

/**
 * This hook is used to set a string value in the context.
 * If you want a value to be based on another value then use
 * following setField hook.
 * https://hooks-common.feathersjs.com/hooks.html#setfield
 */
export default (propertyName: string, propertyValue: string, inData?: false) => {
  return (context: HookContext): HookContext => {
    if (inData) {
      if (Array.isArray(context.data)) {
        context.data = context.data.map((item) => {
          return {
            ...item,
            [propertyName]: propertyValue
          }
        })
      } else {
        context.data = {
          ...context.data,
          [propertyName]: propertyValue
        }
      }
    } else {
      context.params.query = {
        ...context.params.query,
        [propertyName]: propertyValue
      }
    }
    return context
  }
}
