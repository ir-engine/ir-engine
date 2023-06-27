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
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const partyPath = 'party'

export const partyMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const partySchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
    maxMembers: Type.Integer(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Party', additionalProperties: false }
)
export type PartyType = Static<typeof partySchema>

// Schema for creating new entries
export const partyDataSchema = Type.Pick(partySchema, ['name', 'maxMembers'], {
  $id: 'PartyData'
})
export type PartyData = Static<typeof partyDataSchema>

// Schema for updating existing entries
export const partyPatchSchema = Type.Partial(partySchema, {
  $id: 'PartyPatch'
})
export type PartyPatch = Static<typeof partyPatchSchema>

// Schema for allowed query properties
export const partyQueryProperties = Type.Pick(partySchema, ['id', 'name', 'maxMembers'])
export const partyQuerySchema = Type.Intersect(
  [
    querySyntax(partyQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type PartyQuery = Static<typeof partyQuerySchema>
