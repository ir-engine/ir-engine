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

import { Static, Type } from '@feathersjs/typebox'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const oembedPath = 'oembed'

export const oembedMethods = ['find'] as const

export const oembedSchema = Type.Object(
  {
    version: Type.String(),
    type: Type.String(),
    title: Type.String(),
    description: Type.String(),
    provider_name: Type.String(),
    provider_url: Type.String(),
    thumbnail_url: Type.String(),
    thumbnail_width: Type.Number(),
    thumbnail_height: Type.Number(),
    query_url: Type.String(),
    url: Type.Optional(Type.String()),
    height: Type.Optional(Type.Number()),
    width: Type.Optional(Type.Number())
  },
  {
    $id: 'Oembed'
  }
)
export type OembedType = Static<typeof oembedSchema>
