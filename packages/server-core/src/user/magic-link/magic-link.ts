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

import { magicLinkMethods, magicLinkPath } from '@etherealengine/engine/src/schemas/user/magic-link.schema'
import { Application } from '../../../declarations'
import { MagicLinkService } from './magic-link.class'
import magicLinkDocs from './magic-link.docs'
import hooks from './magic-link.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [magicLinkPath]: MagicLinkService
  }
}

export default (app: Application): void => {
  app.use(magicLinkPath, new MagicLinkService(app), {
    // A list of all methods this service exposes externally
    methods: magicLinkMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: magicLinkDocs
  })

  const service = app.service(magicLinkPath)
  service.hooks(hooks)
}
