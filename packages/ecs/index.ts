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

// ensure dependency modules are imported
import '@ir-engine/hyperflux'

import { getAllEntities, getEntityComponents, Not } from '@ir-engine/ecs'

import { Types } from './src/bitecsLegacy'
import {
  defineComponent,
  getAllComponentData,
  getAllComponents,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  removeAllComponents,
  removeComponent,
  serializeComponent,
  setComponent,
  updateComponent,
  useComponent,
  useOptionalComponent
} from './src/ComponentFunctions'
import { executeFixedSystem, executeSystems, getDAG } from './src/EngineFunctions'
import { UndefinedEntity } from './src/Entity'
import { createEntity, entityExists, removeEntity, useEntityContext } from './src/EntityFunctions'
import { EntityTreeComponent } from './src/EntityTree'
import { defineQuery, QueryReactor, removeQuery, useQuery } from './src/QueryFunctions'
import { defineSystem, destroySystem, executeSystem, useExecute } from './src/SystemFunctions'
import { UUIDComponent } from './src/UUIDComponent'

const ECS = {
  /** Component API */
  defineComponent,
  getOptionalMutableComponent,
  getMutableComponent,
  getOptionalComponent,
  getComponent,
  setComponent,
  updateComponent,
  hasComponent,
  removeComponent,
  getAllComponents,
  getAllComponentData,
  removeAllComponents,
  serializeComponent,
  useComponent,
  useOptionalComponent,
  UUIDComponent,
  /** Entity API */
  createEntity,
  removeEntity,
  entityExists,
  useEntityContext,
  UndefinedEntity,
  /** Hierarchy */
  EntityTreeComponent,
  /** System API */
  executeSystem,
  defineSystem,
  useExecute,
  destroySystem,
  /** Queries */
  defineQuery,
  removeQuery,
  useQuery,
  QueryReactor,
  /** Pipeline Functions */
  executeSystems,
  executeFixedSystem,
  getDAG,
  /** bitECS Functions */
  Types,
  Not,
  getAllEntities,
  getEntityComponents
}

globalThis.ECS = ECS

export default ECS

export { getAllEntities, getEntityComponents, Not } from 'bitecs'
export { Types } from './src/bitecsLegacy'
export type { Type, TypedArray } from './src/bitecsLegacy'

export * from './src/ComponentFunctions'
export * from './src/EasingFunctions'
export * from './src/ECSState'
export * from './src/Engine'
export * from './src/EngineFunctions'
export * from './src/EngineState'
export * from './src/Entity'
export * from './src/EntityFunctions'
export * from './src/EntityTree'
export * from './src/QueryFunctions'
export * from './src/schemas/ECSSchemas'
export * from './src/schemas/JSONSchemas'
export * from './src/schemas/JSONSchemaTypes'
export * from './src/SystemFunctions'
export * from './src/SystemGroups'
export * from './src/Timer'
export * from './src/TransitionSystem'
export * from './src/UUIDComponent'
export { ECS }
