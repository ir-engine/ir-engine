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
import { TypedString } from '../../common/types/TypeboxUtils'
import { locationSchema } from '../social/location.schema'
import { dataValidator, queryValidator } from '../validators'
import { InstanceID } from './instance.schema'

export const instanceActivePath = 'instance-active'

export const instanceActiveMethods = ['find'] as const

// Main data model schema
export const instanceActiveSchema = Type.Object(
  {
    id: TypedString<InstanceID>({
      format: 'uuid'
    }),
    currentUsers: Type.Integer(),
    location: Type.Ref(locationSchema)
  },
  { $id: 'InstanceActive', additionalProperties: false }
)
export type InstanceActiveType = Static<typeof instanceActiveSchema>

// Schema for creating new entries
export const instanceActiveDataSchema = Type.Pick(instanceActiveSchema, ['location', 'currentUsers'], {
  $id: 'InstanceActiveData'
})
export type InstanceActiveData = Static<typeof instanceActiveDataSchema>

// Schema for updating existing entries
export const instanceActivePatchSchema = Type.Partial(instanceActiveSchema, {
  $id: 'InstanceActivePatch'
})
export type InstanceActivePatch = Static<typeof instanceActivePatchSchema>

// Schema for allowed query properties
export const instanceActiveQueryProperties = Type.Pick(instanceActiveSchema, ['id', 'location', 'currentUsers'])
export const instanceActiveQuerySchema = Type.Intersect(
  [
    querySyntax(instanceActiveQueryProperties),
    // Add additional query properties here
    Type.Object({ sceneId: Type.String() }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type InstanceActiveQuery = Static<typeof instanceActiveQuerySchema>

export const instanceActiveValidator = getValidator(instanceActiveSchema, dataValidator)
export const instanceActiveDataValidator = getValidator(instanceActiveDataSchema, dataValidator)
export const instanceActivePatchValidator = getValidator(instanceActivePatchSchema, dataValidator)
export const instanceActiveQueryValidator = getValidator(instanceActiveQuerySchema, queryValidator)
