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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import type { HookContext } from '@etherealengine/server-core/declarations'

import { StaticResourceType, staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import {
  RecordingResourceType,
  recordingResourcePath
} from '@etherealengine/engine/src/schemas/recording/recording-resource.schema'
import {
  RecordingID,
  RecordingQuery,
  RecordingType
} from '@etherealengine/engine/src/schemas/recording/recording.schema'
import { getDateTimeSql } from '../../util/get-datetime-sql'

export const recordingResolver = resolve<RecordingType, HookContext>({
  resources: virtual(async (recording, context) => {
    const recordingResource = (await context.app.service(recordingResourcePath).find({
      query: {
        recordingId: recording.id
      },
      paginate: false
    })) as RecordingResourceType[]

    //TODO: We should replace `as any as StaticResourceType` with `as StaticResourceType` once static-resource service is migrated to feathers 5.
    const staticResource = [] as StaticResourceType[]

    for (const resource of recordingResource) {
      const staticResourceResult = (await context.app
        .service(staticResourcePath)
        .get(resource.staticResourceId)) as any as StaticResourceType

      staticResource.push(staticResourceResult)
    }

    return staticResource
  })
})

export const recordingResourceExternalResolver = resolve<RecordingType, HookContext>({})

export const recordingResourceDataResolver = resolve<RecordingType, HookContext>({
  id: async () => {
    return v4() as RecordingID
  },
  resources: async (value, recording) => {
    return {
      ...recording.resources,
      id: v4(),
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const recordingResourcePatchResolver = resolve<RecordingType, HookContext>({
  updatedAt: getDateTimeSql
})

export const recordingResourceQueryResolver = resolve<RecordingQuery, HookContext>({})
