import * as Automerge from '@automerge/automerge'
import { TypedArray } from 'bitecs'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { AvatarControllerComponent } from '../avatar/components/AvatarControllerComponent'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { Entity } from './classes/Entity'
import {
  Component,
  ComponentMap,
  defineQuery,
  getComponent,
  hasComponent,
  setComponent
} from './functions/ComponentFunctions'
import { createEntity } from './functions/EntityFunctions'

export type ComponentSerializationSchema = {
  [componentName: string]: {
    [propertyName: string]: any
  }
}

export type CRDTType = {
  data: SerializedEntityProps
}

export type SerializedEntityProps = {
  [uuid: EntityUUID]: {
    [componentName: string]: {
      json: {
        [propertyName: string]: any
      }
      buffers: {
        [propertyName: string]: number
      }
    }
  }
}

export type SerializedChunk = {
  startTimecode: number
  changes: Uint8Array[]
}

export type SerializerArgs = {
  entities: Entity[]
  /** The length of the chunk in frames */
  schema: Array<{
    component: Component<any>
    properties?: string[]
    buffers?: {
      [propertyName: string]: TypedArray
    }
  }>
  chunkLength: number
  onCommitChunk: (chunk: SerializedChunk) => void
}

const getNestedProperty = (obj: any, path: string) => {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length; i++) {
    if (current[parts[i]] === undefined) {
      return undefined
    }
    current = current[parts[i]]
  }
  return current
}

const setNestedProperty = (obj: any, path: string, value: any) => {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined) {
      current[parts[i]] = {}
    }
    current = current[parts[i]]
  }
  current[parts[parts.length - 1]] = value
}

const createSerializer = ({ entities, schema, chunkLength, onCommitChunk }: SerializerArgs) => {
  const eidMap = new Map<Entity, number>()

  let data = {
    startTimecode: Date.now(),
    changes: []
  } as SerializedChunk

  let lastDoc = Automerge.init<CRDTType>()

  let frame = 0

  const write = () => {
    const newDoc = Automerge.change(lastDoc, (doc) => {
      for (const entity of entities) {
        const uuid = getComponent(entity, UUIDComponent)

        doc.data = {}

        doc.data[uuid] = {}

        const entityData = doc.data[uuid]

        for (const componentSchema of schema) {
          if (hasComponent(entity, componentSchema.component)) {
            entityData[componentSchema.component.name] = {
              json: {},
              buffers: {}
            }
            const componentData = entityData[componentSchema.component.name]

            const component = componentSchema.component

            /** Properties */
            const comp = getComponent(entity, component)

            if (componentSchema.properties) {
              for (const prop of componentSchema.properties) {
                componentData.json[prop] = getNestedProperty(comp, prop)
              }
            }

            if (componentSchema.buffers) {
              for (const prop in componentSchema.buffers) {
                componentData.buffers[prop] = getNestedProperty(comp, prop)
              }
            }
          }
        }
      }
    })

    const frameData = frame > 0 ? Automerge.getChanges(lastDoc, newDoc)[0] : Automerge.save(newDoc)

    lastDoc = newDoc

    data.changes.push(frameData)

    frame++

    if (frame > chunkLength) {
      commitChunk()
    }

    return frameData
  }

  const commitChunk = () => {
    frame = 0
    onCommitChunk(data)
    data = {
      startTimecode: Date.now(),
      changes: []
    } as SerializedChunk
    eidMap.clear()
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

export const createDeserializer = (chunks: SerializedChunk[]) => {
  const eidMap = new Map<number, Entity>()

  let chunk = 0
  let frame = 0

  let doc = Automerge.init<CRDTType>()

  const read = () => {
    const data = chunks[chunk]
    const frameData = data.changes[frame]

    doc = frame === 0 ? Automerge.load(chunks[chunk].changes[frame]) : Automerge.applyChanges(doc, [frameData])[0]

    for (const [uuid, data] of Object.entries(doc.data)) {
      console.log(uuid, data)
      /** Create entity if it doesn't exist */
      if (!UUIDComponent.entitiesByUUID.value[uuid]) {
        const entity = createEntity()
        eidMap.set(entity, entity)
        setComponent(entity, UUIDComponent, data.entities[entity])
      }
      /** Apply data to entity */
      const entity = UUIDComponent.entitiesByUUID.value[uuid]
      for (const componentName in data) {
        const componentData = data[componentName]
        console.log(componentData)
        const component = ComponentMap.get(componentName)!
        if (!hasComponent(entity, component)) {
          setComponent(entity, component)
        }
        const comp = getComponent(entity, component)
        for (const prop in componentData.json) {
          setNestedProperty(comp, prop, componentData.json[prop])
        }
        for (const prop in componentData.buffers) {
          setNestedProperty(comp, prop, componentData.buffers[prop])
        }
      }
    }
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

export default async function ECSSerializationSystem() {
  /** temporary test */
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyM') {
      const chunks = [] as SerializedChunk[]
      const serializer = ECSSerialization.createSerializer({
        entities: defineQuery([AvatarControllerComponent])(),
        schema: [
          {
            component: AvatarControllerComponent,
            properties: [
              'cameraEntity',
              'movementEnabled',
              'isJumping',
              'isWalking',
              'isInAir',
              'verticalVelocity',
              'gamepadJumpActive'
            ]
          },
          {
            component: RigidBodyComponent,
            buffers: {
              'position.x': RigidBodyComponent.position.x,
              'position.y': RigidBodyComponent.position.y,
              'position.z': RigidBodyComponent.position.z,
              'rotation.x': RigidBodyComponent.rotation.x,
              'rotation.y': RigidBodyComponent.rotation.y,
              'rotation.z': RigidBodyComponent.rotation.z,
              'rotation.w': RigidBodyComponent.rotation.w
            }
          }
        ],
        chunkLength: 100000,
        onCommitChunk: (chunk) => {
          chunks.push(chunk)
        }
      })

      setTimeout(() => {
        serializer.end()
        console.log('chunks', chunks)
        setTimeout(() => {
          const deserializer = ECSSerialization.createDeserializer(chunks)
        }, 2000)
      }, 5000)
    }
  })

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
