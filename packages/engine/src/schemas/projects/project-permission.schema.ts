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
import { UserID, userSchema } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const projectPermissionPath = 'project-permission'

export const projectPermissionMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const projectPermissionSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    projectId: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    type: Type.String(),
    user: Type.Ref(userSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ProjectPermission', additionalProperties: false }
)
export type ProjectPermissionType = Static<typeof projectPermissionSchema>

// Schema for creating new entries
export const projectPermissionDataProperties = Type.Partial(projectPermissionSchema)

export const projectPermissionDataSchema = Type.Intersect(
  [projectPermissionDataProperties, Type.Object({ inviteCode: Type.Optional(Type.String()) })],
  {
    $id: 'ProjectPermissionData',
    additionalProperties: false
  }
)
export type ProjectPermissionData = Static<typeof projectPermissionDataSchema>

// Schema for updating existing entries
export const projectPermissionPatchSchema = Type.Partial(projectPermissionSchema, {
  $id: 'ProjectPermissionPatch'
})
export type ProjectPermissionPatch = Static<typeof projectPermissionPatchSchema>

// Schema for allowed query properties
export const projectPermissionQueryProperties = Type.Pick(projectPermissionSchema, [
  'id',
  'projectId',
  'userId',
  'type'
])
export const projectPermissionQuerySchema = Type.Intersect(
  [
    querySyntax(projectPermissionQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ProjectPermissionQuery = Static<typeof projectPermissionQuerySchema>

export const projectPermissionValidator = getValidator(projectPermissionSchema, dataValidator)
export const projectPermissionDataValidator = getValidator(projectPermissionDataSchema, dataValidator)
export const projectPermissionPatchValidator = getValidator(projectPermissionPatchSchema, dataValidator)
export const projectPermissionQueryValidator = getValidator(projectPermissionQuerySchema, queryValidator)
