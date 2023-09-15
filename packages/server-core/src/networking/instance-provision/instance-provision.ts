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

import {
  instanceProvisionMethods,
  instanceProvisionPath
} from '@etherealengine/engine/src/schemas/networking/instance-provision.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { InstanceProvisionService } from './instance-provision.class'
import instanceProvisionDocs from './instance-provision.docs'
import hooks from './instance-provision.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [instanceProvisionPath]: InstanceProvisionService
  }
}

export default (app: Application): void => {
  app.use(instanceProvisionPath, new InstanceProvisionService(app), {
    // A list of all methods this service exposes externally
    methods: instanceProvisionMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceProvisionDocs
  })

  const service = app.service(instanceProvisionPath)
  service.hooks(hooks)

  /**
   * A method which is used to create instance provision
   *
   * @param data which is parsed to create instance provision
   * @returns created instance provision
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      return app.channel(`userIds/${data.userId}`).send({
        ipAddress: data.ipAddress,
        port: data.port,
        locationId: data.locationId,
        sceneId: data.sceneId,
        channelId: data.channelId,
        instanceId: data.instanceId
      })
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
