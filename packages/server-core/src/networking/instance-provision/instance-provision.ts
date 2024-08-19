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

import {
  instanceProvisionMethods,
  instanceProvisionPath
} from '@ir-engine/common/src/schemas/networking/instance-provision.schema'
import { InstanceID } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { ChannelID } from '@ir-engine/common/src/schemas/social/channel.schema'
import { LocationID } from '@ir-engine/common/src/schemas/social/location.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { InstanceProvisionService } from './instance-provision.class'
import instanceProvisionDocs from './instance-provision.docs'
import hooks from './instance-provision.hooks'

declare module '@ir-engine/common/declarations' {
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
        locationId: data.locationId as LocationID,
        sceneId: data.sceneId,
        channelId: data.channelId as ChannelID,
        instanceId: data.instanceId as InstanceID
      })
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
