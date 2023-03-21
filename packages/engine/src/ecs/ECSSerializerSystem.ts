import { decode, encode } from 'msgpackr'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'

import { getComponent } from '../ecs/functions/ComponentFunctions'
import { checkBitflag } from '../networking/serialization/DataReader'
import { writeEntity } from '../networking/serialization/DataWriter'
import { SerializationSchema } from '../networking/serialization/Utils'
import {
  createViewCursor,
  readUint8,
  readUint32,
  sliceViewCursor,
  spaceUint32,
  ViewCursor
} from '../networking/serialization/ViewCursor'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { Entity, UndefinedEntity } from './classes/Entity'
import { entityExists } from './functions/EntityFunctions'

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
  onCommitChunk: (chunk: Buffer, chunkIndex: number) => void
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

    const dataBuffer = encode(data)
    onCommitChunk(dataBuffer, chunk++)

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
  const entityIndex = readUint32(v) as NetworkId
  const changeMask = readUint8(v)

  let entity = UUIDComponent.entitiesByUUID.value[entities[entityIndex]] || UndefinedEntity
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

export const createDeserializer = (chunks: Buffer[], schema: SerializationSchema[]) => {
  let chunk = 0
  let frame = 0

  const read = () => {
    const data = decode(new Uint8Array(chunks[chunk]))
    const frameData = data.changes[frame]

    const view = createViewCursor(frameData)

    readEntities(view, frameData.byteLength, data.entities, schema)

    frame++

    if (frame >= data.changes.length) {
      chunk++
      if (chunk >= chunks.length) {
        end()
      }
    }
  }

  const end = () => {
    ActiveDeserializers.delete(deserializer)
  }

  const deserializer = { read, end }

  ActiveDeserializers.add(deserializer)

  return deserializer
}

export type ECSDeserializer = ReturnType<typeof createDeserializer>

export const ActiveDeserializers = new Set<ECSDeserializer>()

export const ECSSerialization = {
  createSerializer,
  createDeserializer
}

export default async function ECSSerializerSystem() {
  const execute = () => {
    for (const serializer of ActiveSerializers) {
      serializer.write()
    }

    for (const deserializer of ActiveDeserializers) {
      deserializer.read()
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
