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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

// ensure dependency modules are imported
import '@ir-engine/hyperflux'

export { Not, getAllEntities, getEntityComponents } from 'bitecs'

export * from './src/ComponentFunctions'
export * from './src/EasingFunctions'
export * from './src/ECSState'
export * from './src/Engine'
export * from './src/EngineFunctions'
export * from './src/EngineState'
export * from './src/Entity'
export * from './src/EntityTree'
export * from './src/network/DataReader'
export * from './src/network/DataWriter'
export * from './src/network/EntityNetworkState'
export * from './src/network/IncomingActionSystem'
export * from './src/network/IncomingNetworkSystem'
export * from './src/network/NetworkObjectComponent'
export * from './src/network/NetworkSerializationState'
export * from './src/network/OutgoingActionSystem'
export * from './src/network/OutgoingNetworkSystem'
export * from './src/network/RingBuffer'
export * from './src/network/Utils'
export * from './src/network/ViewCursor'
export * from './src/network/WorldNetworkAction'
export * from './src/QueryFunctions'
export * from './src/schemas/JSONSchemas'
export * from './src/schemas/JSONSchemaTypes'
export * from './src/schemas/JSONSchemaUtils'
export * from './src/schemas/proxySoAStore'
export * from './src/SystemFunctions'
export * from './src/SystemGroups'
export * from './src/Timer'
export * from './src/TransitionSystem'
export * from './src/UUIDComponent'
