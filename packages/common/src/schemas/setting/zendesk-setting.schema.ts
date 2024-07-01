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
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const zendeskSettingPath = 'zendesk-setting'

export const zendeskSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const zendeskSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    secret: Type.String(),
    kid: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ZendeskSetting', additionalProperties: false }
)
export interface ZendeskSettingType extends Static<typeof zendeskSettingSchema> {}

// Schema for creating new entries
export const zendeskSettingDataSchema = Type.Pick(zendeskSettingSchema, ['name', 'secret', 'kid'], {
  $id: 'ZendeskSettingData'
})
export interface ZendeskSettingData extends Static<typeof zendeskSettingDataSchema> {}

// Schema for updating existing entries
export const zendeskSettingPatchSchema = Type.Partial(zendeskSettingSchema, {
  $id: 'ZendeskSettingPatch'
})
export interface ZendeskSettingPatch extends Static<typeof zendeskSettingPatchSchema> {}

// Schema for allowed query properties
export const zendeskSettingQueryProperties = Type.Pick(zendeskSettingSchema, ['id', 'name'])

export const zendeskSettingQuerySchema = Type.Intersect(
  [
    querySyntax(zendeskSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ZendeskSettingQuery extends Static<typeof zendeskSettingQuerySchema> {}

export const zendeskSettingValidator = /* @__PURE__ */ getValidator(zendeskSettingSchema, dataValidator)
export const zendeskSettingDataValidator = /* @__PURE__ */ getValidator(zendeskSettingDataSchema, dataValidator)
export const zendeskSettingPatchValidator = /* @__PURE__ */ getValidator(zendeskSettingPatchSchema, dataValidator)
export const zendeskSettingQueryValidator = /* @__PURE__ */ getValidator(zendeskSettingQuerySchema, queryValidator)
