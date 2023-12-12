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
  recordingResourceUploadMethods,
  recordingResourceUploadPath
} from '@etherealengine/engine/src/schemas/recording/recording-resource-upload.schema'
import { Application } from '../../../declarations'
import { RecordingResourceUploadService } from './recording-resource-upload.class'
import RecordingResourceUploadDocs from './recording-resource-upload.docs'
import hooks from './recording-resource-upload.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [recordingResourceUploadPath]: RecordingResourceUploadService
  }
}

export default (app: Application): void => {
  app.use(recordingResourceUploadPath, new RecordingResourceUploadService(app), {
    // A list of all methods this service exposes externally
    methods: recordingResourceUploadMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: RecordingResourceUploadDocs
  })

  const service = app.service(recordingResourceUploadPath)
  service.hooks(hooks)
}
