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
  instanceSignalingMethods,
  instanceSignalingPath
} from '@ir-engine/common/src/schemas/networking/instance-signaling.schema'

import { instanceAttendancePath, instancePath } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'
import { InstanceSignalingService } from './instance-signaling.class'
import instanceProvisionDocs from './instance-signaling.docs'
import hooks from './instance-signaling.hooks'
import { getState } from '@ir-engine/hyperflux'
import { ServerMode, ServerState } from '../../ServerState'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instanceSignalingPath]: InstanceSignalingService
  }
}

export default (app: Application): void => {
  app.use(instanceSignalingPath, new InstanceSignalingService(), {
    // A list of all methods this service exposes externally
    methods: instanceSignalingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceProvisionDocs
  })

  const service = app.service(instanceSignalingPath)
  service.hooks(hooks)

  if (getState(ServerState).serverMode !== ServerMode.API) return

  app.on('disconnect', async (connection) => {
    const peerID = connection.socketQuery.peerID
    if (!peerID) return

    const instanceAttendance = await app.service(instanceAttendancePath).patch(
      null,
      {
        ended: true
      },
      {
        query: {
          peerId: peerID
        }
      }
    )
    if (!instanceAttendance?.length) return

    app.channel(`instance/${instanceAttendance[0].instanceId}`).leave(connection)
  })

  app.service(instanceAttendancePath).publish('patched', async (data, context) => {
    // assume only one instanceAttendance is patched at a time
    const [instanceAttendance] = Array.isArray(data) ? data : 'data' in data ? data.data : [data]
    if (!instanceAttendance.ended) return

    const instance = await app.service(instancePath).get(instanceAttendance.instanceId)
    if (instance.currentUsers === 0) {
      await app.service(instancePath).patch(instanceAttendance.instanceId, {
        ended: true
      })
    }

    return app.channel(`instance/${instanceAttendance.instanceId}`).send([instanceAttendance])
  })

  app.service(instanceAttendancePath).publish('created', async (data, context) => {
    // assume only one instanceAttendance is patched at a time
    const [instanceAttendance] = Array.isArray(data) ? data : 'data' in data ? data.data : [data]

    return app.channel(`instance/${instanceAttendance.instanceId}`).send([instanceAttendance])
  })
}
