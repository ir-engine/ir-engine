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

import { Static, Type, querySyntax } from '@feathersjs/typebox'
import { sceneDataSchema } from './scene.schema'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const sceneDataPath = 'scene-data'

export const sceneDataMethods = ['get', 'find'] as const

export const sceneDataServiceSchema = Type.Object(
  {
    data: Type.Array(Type.Ref(sceneDataSchema))
  },
  { $id: 'SceneDataService', additionalProperties: false }
)
export type SceneDataServiceType = Static<typeof sceneDataServiceSchema>

// Schema for allowed query properties
export const sceneDataQueryProperties = Type.Partial(sceneDataServiceSchema)
export const sceneDataQuerySchema = Type.Intersect(
  [
    querySyntax(sceneDataQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        internal: Type.Optional(Type.Boolean()),
        projectName: Type.Optional(Type.String()),
        metadataOnly: Type.Optional(Type.Boolean()),
        storageProviderName: Type.Optional(Type.String()),
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type SceneDataQuery = Static<typeof sceneDataQuerySchema>
