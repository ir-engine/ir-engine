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
import { getValidator, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator } from '../validators'
import { InstanceID } from './instance.schema'

export const instanceSignalingPath = 'instance-signaling'

export const instanceSignalingMethods = ['get', 'find', 'create'] as const

// Main data model schema
export const instanceSignalingSchema = Type.Object(
  {
    instanceID: TypedString<InstanceID>()
  },
  { $id: 'InstanceSignaling', additionalProperties: false }
)
export interface InstanceSignalingType extends Static<typeof instanceSignalingSchema> {}

// Schema for creating new entries
export const instanceSignalingDataSchema = Type.Partial(
  Type.Pick(instanceSignalingSchema, ['instanceID'], {
    $id: 'InstanceSignalingData'
  })
)
export interface InstanceSignalingDataType extends Static<typeof instanceSignalingDataSchema> {}

export const instanceSignalingValidator = /* @__PURE__ */ getValidator(instanceSignalingSchema, dataValidator)
