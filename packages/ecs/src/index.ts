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

import { getAllEntities, Not, Types } from 'bitecs'

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
} from './ComponentFunctions'
import { executeFixedSystem, executeSystems, getDAG } from './EngineFunctions'
import { UndefinedEntity } from './Entity'
import { createEntity, entityExists, removeEntity, useEntityContext } from './EntityFunctions'
import { defineQuery, QueryReactor, removeQuery, useQuery } from './QueryFunctions'
import { defineSystem, destroySystem, executeSystem, useExecute } from './SystemFunctions'
import { UUIDComponent } from './UUIDComponent'

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
  Not,
  Types,
  getAllEntities
}

globalThis.ECS = ECS

export default ECS

export { Not } from 'bitecs'
export * from './ComponentFunctions'
export * from './ECSState'
export * from './Engine'
export * from './EngineFunctions'
export * from './Entity'
export * from './EntityFunctions'
export * from './QueryFunctions'
export * from './SystemFunctions'
export * from './SystemGroups'
export * from './Timer'
export * from './UUIDComponent'
export { ECS }
