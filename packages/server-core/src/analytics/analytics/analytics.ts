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

import { analyticsMethods, analyticsPath } from '@ir-engine/common/src/schemas/analytics/analytics.schema'

import { Application } from '../../../declarations'
import { AnalyticsService } from './analytics.class'
import analyticsDocs from './analytics.docs'
import hooks from './analytics.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [analyticsPath]: AnalyticsService
  }
}

export default (app: Application): void => {
  const options = {
    name: analyticsPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(analyticsPath, new AnalyticsService(options), {
    // A list of all methods this service exposes externally
    methods: analyticsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: analyticsDocs
  })

  const service = app.service(analyticsPath)
  service.hooks(hooks)
}
