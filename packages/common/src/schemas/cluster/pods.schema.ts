/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, StringEnum, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { InstanceID } from '../networking/instance.schema'
import { dataValidator } from '../validators'

export const podsPath = 'pods'

export const podsMethods = ['find', 'get', 'remove'] as const

export const serverContainerInfoSchema = Type.Object(
  {
    name: Type.String(),
    restarts: Type.Number(),
    status: StringEnum(['Running', 'Terminated', 'Waiting', 'Undefined']),
    ready: Type.Boolean(),
    started: Type.Boolean(),
    image: Type.String()
  },
  { $id: 'ServerContainerInfo', additionalProperties: false }
)
export interface ServerContainerInfoType extends Static<typeof serverContainerInfoSchema> {}

export const serverPodInfoSchema = Type.Object(
  {
    name: Type.String(),
    status: Type.String(),
    age: Type.String({ format: 'date-time' }),
    containers: Type.Array(Type.Ref(serverContainerInfoSchema)),
    type: Type.Optional(Type.String()),
    locationSlug: Type.Optional(Type.String()),
    instanceId: Type.Optional(
      TypedString<InstanceID>({
        format: 'uuid'
      })
    ),
    currentUsers: Type.Optional(Type.Number())
  },
  { $id: 'ServerPodInfo', additionalProperties: false }
)
export interface ServerPodInfoType extends Static<typeof serverPodInfoSchema> {}

// Main data model schema
export const podsSchema = Type.Object(
  {
    id: Type.String(),
    label: Type.String(),
    pods: Type.Array(Type.Ref(serverPodInfoSchema))
  },
  { $id: 'Pods', additionalProperties: false }
)
export interface PodsType extends Static<typeof podsSchema> {}

export const serverContainerInfoValidator = /* @__PURE__ */ getValidator(serverContainerInfoSchema, dataValidator)
export const serverPodInfoValidator = /* @__PURE__ */ getValidator(serverPodInfoSchema, dataValidator)
export const podsValidator = /* @__PURE__ */ getValidator(podsSchema, dataValidator)
