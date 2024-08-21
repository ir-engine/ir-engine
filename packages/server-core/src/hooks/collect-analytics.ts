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

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import ua from 'universal-analytics'

import config from '../appconfig'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.method === 'remove') return context
    if (!context.params.user) {
      // send a anonymous user's analytics
      const visitor = ua(config.server.gaTrackingId, { https: false })
      visitor.pageview(context.service).send()
      visitor.event(context.method, 'Request').send()
    } else {
      // send the user's analytics
      const visitor = ua(config.server.gaTrackingId, context.params.user._id, { https: false })
      visitor.pageview(context.service).send()
      visitor.event(context.method, 'Request').send()
    }
    return context
  }
}
