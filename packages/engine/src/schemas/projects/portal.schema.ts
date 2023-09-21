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
import type { Static } from '@feathersjs/typebox'
import { Type, querySyntax } from '@feathersjs/typebox'

export const portalPath = 'portal'

export const portalMethods = ['get', 'find'] as const

export const portalSchema = Type.Object(
  {
    sceneName: Type.String(),
    portalEntityId: Type.String(),
    portalEntityName: Type.String(),
    previewImageURL: Type.String(),
    spawnPosition: Type.Any(), //Vector3
    spawnRotation: Type.Any() //Euler
  },
  { $id: 'Portal', additionalProperties: false }
)
export type PortalType = Static<typeof portalSchema>

// Schema for allowed query properties
export const portalQueryProperties = Type.Pick(portalSchema, ['sceneName', 'portalEntityId', 'portalEntityName'])
export const portalQuerySchema = Type.Intersect(
  [
    querySyntax(portalQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        metadataOnly: Type.Optional(Type.Boolean()),
        locationName: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type PortalQuery = Static<typeof portalQuerySchema>
