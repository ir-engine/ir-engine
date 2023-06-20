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

import { AudioInterface } from '@etherealengine/common/src/dbmodels/Audio'

import { Application } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import { audioUpload } from './audio-upload.helper'
import { Audio } from './audio.class'
import audioDocs from './audio.docs'
import hooks from './audio.hooks'
import createModel from './audio.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    audio: Audio
    'audio-upload': any
  }
  interface Models {
    audio: ReturnType<typeof createModel> & AudioInterface
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Audio(options, app)
  event.docs = audioDocs

  app.use('audio', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('audio')

  service.hooks(hooks)

  app.use('audio-upload', {
    create: async (data) => {
      return audioUpload(app, data)
    }
  })

  app.service('audio-upload').hooks({
    before: {
      create: [authenticate(), verifyScope('editor', 'write')]
    }
  })
}
