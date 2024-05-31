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

import { assetMethods, assetPath, AssetUpdate } from '@etherealengine/common/src/schemas/assets/asset.schema'
import { instanceActivePath } from '@etherealengine/common/src/schemas/networking/instance-active.schema'
import {
  instanceAttendancePath,
  InstanceAttendanceType
} from '@etherealengine/common/src/schemas/networking/instance-attendance.schema'
import { getState } from '@etherealengine/hyperflux'

import { Application } from '../../../declarations'
import { ServerMode, ServerState } from '../../ServerState'
import { AssetService } from './asset.class'
import sceneDocs from './asset.docs'
import hooks from './asset.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [assetPath]: AssetService
  }
}

export default (app: Application): void => {
  const options = {
    name: assetPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(assetPath, new AssetService(options), {
    // A list of all methods this service exposes externally
    methods: assetMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: sceneDocs
  })

  const service = app.service(assetPath)
  service.hooks(hooks)

  if (getState(ServerState).serverMode === ServerMode.API)
    service.publish('updated', async (data) => {
      const updatedScene = data as AssetUpdate
      const instanceActive = await app.service(instanceActivePath).find({
        query: { sceneId: updatedScene.id }
      })

      const instanceAttendances = (await app.service(instanceAttendancePath).find({
        query: {
          instanceId: {
            $in: instanceActive.map((item) => item.id)
          },
          ended: false
        },
        paginate: false
      })) as InstanceAttendanceType[]

      return Promise.all(
        instanceAttendances.map((instanceAttendance) => {
          return app.channel(`userIds/${instanceAttendance.userId}`).send({})
        })
      )
    })
}
