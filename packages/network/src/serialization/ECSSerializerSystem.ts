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

import { Entity, EntityUUID, getComponent, UUIDComponent } from '@ir-engine/ecs'
import {
  checkBitflag,
  createViewCursor,
  readUint32,
  readUint8,
  rewindViewCursor,
  SerializationSchema,
  sliceViewCursor,
  spaceUint32,
  spaceUint8,
  ViewCursor
} from '@ir-engine/network'

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
  id: string // any ID
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

      const entityIndex = data.entities.indexOf(uuid)

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

  const serializer = { write, commitChunk, end }

  ActiveSerializers.add(serializer)

  return serializer
}

export type ECSSerializer = ReturnType<typeof createSerializer>

export const ActiveSerializers = new Set<ECSSerializer>()

export const readEntity = (v: ViewCursor, entities: EntityUUID[], serializationSchema: SerializationSchema[]) => {
  const entityIndex = readUint32(v)
  const changeMask = readUint8(v)

  const entity = UUIDComponent.getEntityByUUID(entities[entityIndex])

  let b = 0

  for (const component of serializationSchema) {
    if (checkBitflag(changeMask, 1 << b++)) {
      component.read(v, entity)
    }
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

export const createDeserializer = ({ id, chunks, schema, onChunkStarted, onEnd }: DeserializerArgs) => {
  onChunkStarted(0)

  const read = (chunk: number, frame: number) => {
    const data = chunks[chunk] as SerializedChunk
    const frameData = toArrayBuffer(data.changes[frame])

    if (frameData) {
      const view = createViewCursor(frameData)
      readEntities(view, frameData.byteLength, data.entities, schema)
    }

    if (frame >= data.changes.length) {
      onChunkStarted(chunk)
      if (chunk >= chunks.length) {
        end()
        onEnd()
      }
    }
  }

  const end = () => {
    ActiveDeserializers.delete(id)
  }

  const deserializer = { read, end }

  ActiveDeserializers.set(id, deserializer)

  return deserializer
}

export type ECSDeserializer = ReturnType<typeof createDeserializer>

export const ActiveDeserializers = new Map<string, ECSDeserializer>()

export const ECSSerialization = {
  createSerializer,
  createDeserializer
}
