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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'

import { getComponent } from '../ecs/functions/ComponentFunctions'
import { checkBitflag } from '../networking/serialization/DataReader'
import { SerializationSchema } from '../networking/serialization/Utils'
import {
  ViewCursor,
  createViewCursor,
  readUint32,
  readUint8,
  rewindViewCursor,
  sliceViewCursor,
  spaceUint32,
  spaceUint8
} from '../networking/serialization/ViewCursor'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { Entity, UndefinedEntity } from './classes/Entity'
import { entityExists } from './functions/EntityFunctions'
import { defineSystem } from './functions/SystemFunctions'

export type SerializedChunk = {
  startTimecode: number
  entities: EntityUUID[]
  changes: ArrayBuffer[]
}

export type SerializerArgs = {
  entities: () => Entity[]
  /** @todo embed schema in chunk in a way that can be migrated between versions */
  schema: SerializationSchema[]
  /** The length of the chunk in frames */
  chunkLength: number
  onCommitChunk: (chunk: SerializedChunk, chunkIndex: number) => void
}

export type DeserializerArgs = {
  chunks: SerializedChunk[]
  schema: SerializationSchema[]
  onChunkStarted: (chunk: number) => void
  onEnd: () => void
}

const writeEntity = (v: ViewCursor, entityID: number, entity: Entity, serializationSchema: SerializationSchema[]) => {
  const rewind = rewindViewCursor(v)

  const writeEntityID = spaceUint32(v)

  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  for (const component of serializationSchema) {
    changeMask |= component.write(v, entity) ? 1 << b++ : b++ && 0
  }

  if (changeMask > 0) {
    writeEntityID(entityID)
    return writeChangeMask(changeMask)
  }

  return rewind()
}

const createSerializer = ({ entities, schema, chunkLength, onCommitChunk }: SerializerArgs) => {
  let data = {
    startTimecode: Date.now(),
    entities: [],
    changes: []
  } as SerializedChunk

  const view = createViewCursor(new ArrayBuffer(10000))

  let frame = 0
  let chunk = 0

  const write = () => {
    const writeCount = spaceUint32(view)

    let count = 0
    for (const entity of entities()) {
      const uuid = getComponent(entity, UUIDComponent)
      if (!data.entities.includes(uuid)) {
        data.entities.push(uuid)
      }

      // reuse networkid as temp hack to reuse writeEntity
      // maybe we should rename networkid to entityid in writeEntity args?
      const entityIndex = data.entities.indexOf(uuid) as NetworkId

      count += writeEntity(view, entityIndex, entity, schema) ? 1 : 0
    }

    if (count > 0) writeCount(count)
    else view.cursor = 0 // nothing written

    const buffer = sliceViewCursor(view)

    data.changes.push(buffer)

    frame++

    if (frame > chunkLength) {
      commitChunk()
    }
  }

  const commitChunk = () => {
    frame = 0

    onCommitChunk(data, chunk++)

    data = {
      startTimecode: Date.now(),
      entities: [],
      changes: []
    } as SerializedChunk
  }

  const end = () => {
    ActiveSerializers.delete(serializer)
    commitChunk()
  }

  const serializer = { write, commitChunk, end, active: false }

  ActiveSerializers.add(serializer)

  return serializer
}

export type ECSSerializer = ReturnType<typeof createSerializer>

export const ActiveSerializers = new Set<ECSSerializer>()

export const readEntity = (v: ViewCursor, entities: EntityUUID[], serializationSchema: SerializationSchema[]) => {
  const entityIndex = readUint32(v) as NetworkId
  const changeMask = readUint8(v)

  let entity = UUIDComponent.entitiesByUUID[entities[entityIndex]] || UndefinedEntity
  if (!entity || !entityExists(entity)) entity = UndefinedEntity

  let b = 0

  for (const component of serializationSchema) {
    if (checkBitflag(changeMask, 1 << b++)) component.read(v, entity)
  }
}

export const readEntities = (
  v: ViewCursor,
  byteLength: number,
  entities: EntityUUID[],
  schema: SerializationSchema[]
) => {
  while (v.cursor < byteLength) {
    const count = readUint32(v)
    for (let i = 0; i < count; i++) {
      readEntity(v, entities, schema)
    }
  }
}

const toArrayBuffer = (buf) => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export const createDeserializer = ({ chunks, schema, onChunkStarted, onEnd }: DeserializerArgs) => {
  let chunk = 0
  let frame = 0

  onChunkStarted(chunk)

  const read = () => {
    const data = chunks[chunk] as SerializedChunk
    const frameData = toArrayBuffer(data.changes[frame])

    if (frameData) {
      const view = createViewCursor(frameData)
      readEntities(view, frameData.byteLength, data.entities, schema)
    }

    frame++

    if (frame >= data.changes.length) {
      onChunkStarted(chunk)
      chunk++
      if (chunk >= chunks.length) {
        end()
        onEnd()
      }
    }
  }

  const end = () => {
    ActiveDeserializers.delete(deserializer)
  }

  const deserializer = { read, end, active: false }

  ActiveDeserializers.add(deserializer)

  return deserializer
}

export type ECSDeserializer = ReturnType<typeof createDeserializer>

export const ActiveDeserializers = new Set<ECSDeserializer>()

export const ECSSerialization = {
  createSerializer,
  createDeserializer
}

const execute = () => {
  for (const serializer of ActiveSerializers) {
    if (!serializer.active) continue
    serializer.write()
  }

  for (const deserializer of ActiveDeserializers) {
    if (!deserializer.active) continue
    deserializer.read()
  }
}
export const ECSSerializerSystem = defineSystem({
  uuid: 'ee.engine.ecs.ECSSerializerSystem',
  execute
})
