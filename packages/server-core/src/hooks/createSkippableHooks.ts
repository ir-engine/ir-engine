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

import { iff } from 'feathers-hooks-common'

/**
 * This can create a skippable hook that will not be executed if `context.params.skipServiceHooks` is set to true.
 * @param hooks Service hook object
 * @param typesMethods If its undefined then the check will be performs for all hook types and methods, for string or array, it can be for hook type, service method type or a [Hook_Type].[Service_Method] notation
 */
export const createSkippableHooks = (hooks: any, typesMethods?: string | string[]) => {
  if (typesMethods) {
    typesMethods = Array.isArray(typesMethods) ? typesMethods : [typesMethods]
  }

  for (const hookType in hooks) {
    for (const serviceMethod in hooks[hookType]) {
      if (
        !typesMethods || // apply for all if nothing is specified in typesMethods
        typesMethods.includes(hookType) || // apply if hook type is specified in typesMethods
        typesMethods.includes(serviceMethod) || // apply if service method is specified in typesMethods
        typesMethods.includes(`${hookType}.${serviceMethod}`) // apply if `[Hook_Type].[Service_Method]` is specified in typesMethods
      ) {
        hooks[hookType][serviceMethod] = [
          iff((context) => context.params.skipServiceHooks !== true, ...hooks[hookType][serviceMethod])
        ]
      }
    }
  }

  return hooks
}
