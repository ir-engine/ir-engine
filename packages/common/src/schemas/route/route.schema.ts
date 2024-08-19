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

import { OpaqueType } from '../../interfaces'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const routePath = 'route'

export const routeMethods = ['find', 'get', 'create', 'patch', 'remove'] as const
export type RouteID = OpaqueType<'RouteID'> & string

// Main data model schema
export const routeSchema = Type.Object(
  {
    id: TypedString<RouteID>({
      format: 'uuid'
    }),
    route: Type.String(),
    project: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Route', additionalProperties: false }
)
export interface RouteType extends Static<typeof routeSchema> {}

// Schema for creating new entries
export const routeDataSchema = Type.Pick(routeSchema, ['route', 'project'], {
  $id: 'RouteData'
})
export interface RouteData extends Static<typeof routeDataSchema> {}

// Schema for updating existing entries
export const routePatchSchema = Type.Partial(routeSchema, {
  $id: 'RoutePatch'
})
export interface RoutePatch extends Static<typeof routePatchSchema> {}

// Schema for allowed query properties
export const routeQueryProperties = Type.Pick(routeSchema, ['id', 'route', 'project'])
export const routeQuerySchema = Type.Intersect(
  [
    querySyntax(routeQueryProperties),
    // Add additional query properties here
    Type.Object({ paginate: Type.Optional(Type.Boolean()) }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface RouteQuery extends Static<typeof routeQuerySchema> {}

export const routeValidator = /* @__PURE__ */ getValidator(routeSchema, dataValidator)
export const routeDataValidator = /* @__PURE__ */ getValidator(routeDataSchema, dataValidator)
export const routePatchValidator = /* @__PURE__ */ getValidator(routePatchSchema, dataValidator)
export const routeQueryValidator = /* @__PURE__ */ getValidator(routeQuerySchema, queryValidator)
