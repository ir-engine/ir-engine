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

import assert, { strictEqual } from 'assert'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { getMutableState } from '@etherealengine/hyperflux'

import { destroyEngine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { createEngine } from '../../initializeEngine'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import {
  createViewCursor,
  readFloat32,
  readProp,
  readUint16,
  readUint32,
  readUint8,
  sliceViewCursor,
  spaceUint16,
  spaceUint32,
  spaceUint8,
  writeEntityId,
  writeFloat32,
  writeNetworkId,
  writeProp,
  writePropIfChanged,
  writeUint16,
  writeUint32,
  writeUint8
} from './ViewCursor'

describe('ViewCursor read/write', () => {
  beforeEach(() => {
    createEngine()
    const engineState = getMutableState(EngineState)
    engineState.simulationTime.set(1)
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('ViewCursor', () => {
    it('should createViewCursor', () => {
      const view = createViewCursor()
      assert(view.hasOwnProperty('cursor'))
      strictEqual(view.cursor, 0)
      assert(view.hasOwnProperty('shadowMap'))
      assert(view.shadowMap instanceof Map)
    })

    it('should sliceViewCursor', () => {
      const view = createViewCursor()
      writeUint32(view, 32)
      strictEqual(sliceViewCursor(view).byteLength, 4)
      strictEqual(view.cursor, 0)
    })
  })

  describe('writers', () => {
    it('should writeProp', () => {
      const view = createViewCursor()
      const prop = new Float32Array(1)
      const entity = UndefinedEntity
      const val = 1.5
      prop[entity] = val
      writeProp(view, prop, UndefinedEntity)
      strictEqual(view.getFloat32(0), val)
    })

    it('should writePropIfChanged', () => {
      const view = createViewCursor()
      const prop = new Float32Array(1)
      const entity = UndefinedEntity
      const val = 1.5

      prop[entity] = val

      writePropIfChanged(view, prop, UndefinedEntity, false)
      strictEqual(view.getFloat32(0), val)

      writePropIfChanged(view, prop, UndefinedEntity, false)
      strictEqual(view.getFloat32(4), 0)

      prop[entity]++

      writePropIfChanged(view, prop, UndefinedEntity, false)
      strictEqual(view.getFloat32(4), val + 1)
    })

    it('should writeFloat32', () => {
      const view = createViewCursor()
      const val = 1.5
      writeFloat32(view, val)
      strictEqual(view.cursor, Float32Array.BYTES_PER_ELEMENT)
      strictEqual(view.getFloat32(0), val)
    })

    it('should writeUint32', () => {
      const view = createViewCursor()
      const val = 12345678
      writeUint32(view, val)
      strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
      strictEqual(view.getUint32(0), val)
    })

    it('should writeUint16', () => {
      const view = createViewCursor()
      const val = 12345
      writeUint16(view, val)
      strictEqual(view.cursor, Uint16Array.BYTES_PER_ELEMENT)
      strictEqual(view.getUint16(0), val)
    })

    it('should writeUint8', () => {
      const view = createViewCursor()
      const val = 123
      writeUint8(view, val)
      strictEqual(view.cursor, Uint8Array.BYTES_PER_ELEMENT)
      strictEqual(view.getUint8(0), val)
    })

    it('should spaceUint32', () => {
      const view = createViewCursor()
      const val = 12345678
      const writeUint32 = spaceUint32(view)
      writeUint32(val)
      strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
      strictEqual(view.getUint32(0), val)
    })

    it('should spaceUint16', () => {
      const view = createViewCursor()
      const val = 12345
      const writeUint16 = spaceUint16(view)
      writeUint16(val)
      strictEqual(view.cursor, Uint16Array.BYTES_PER_ELEMENT)
      strictEqual(view.getUint16(0), val)
    })

    it('should spaceUint8', () => {
      const view = createViewCursor()
      const val = 123
      const writeUint8 = spaceUint8(view)
      writeUint8(val)
      strictEqual(view.cursor, Uint8Array.BYTES_PER_ELEMENT)
      strictEqual(view.getUint8(0), val)
    })

    it('should writeEntityId', () => {
      const view = createViewCursor()
      const entity = 42 as Entity
      writeEntityId(view, entity)
      strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
      strictEqual(view.getUint32(0), entity)
    })

    it('should writeNetworkId', () => {
      const view = createViewCursor()
      const entity = 42 as Entity
      const netId = 5678 as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      writeNetworkId(view, entity)
      strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
      strictEqual(view.getUint32(0), netId)
    })
  })

  describe('readers', () => {
    it('should readProp', () => {
      const view = createViewCursor()
      const prop = new Float32Array(1)
      const val = 1.5
      view.setFloat32(0, val)
      strictEqual(readProp(view, prop), val)
    })

    it('should readFloat32', () => {
      const view = createViewCursor()
      const val = 1.5
      view.setFloat32(0, val)
      strictEqual(readFloat32(view), val)
    })

    it('should readUint32', () => {
      const view = createViewCursor()
      const val = 12345678
      view.setUint32(0, val)
      strictEqual(readUint32(view), val)
    })

    it('should readUint16', () => {
      const view = createViewCursor()
      const val = 12345
      view.setUint16(0, val)
      strictEqual(readUint16(view), val)
    })

    it('should readUint8', () => {
      const view = createViewCursor()
      const val = 123
      view.setUint8(0, val)
      strictEqual(readUint8(view), val)
    })
  })
})
