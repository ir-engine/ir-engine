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

export type SerializedChunk = {
  startTimecode: number
  entities: { [eid: number]: EntityUUID }
  frames: Array<
    Array<{
      components: {
        [componentName: string]: {
          props: {
            [propertyName: string]: any
          }
          buffers: {
            [propertyName: string]: number
          }
        }
      }
      eid: number
    }>
  >
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
    entities: {},
    frames: []
  } as SerializedChunk
  new Float32Array(16).fill(5)

  let frame = 0

  const write = () => {
    const frameData = [] as SerializedChunk['frames'][0]
    for (const entity of entities) {
      if (!eidMap.has(entity)) {
        const eid = eidMap.size
        eidMap.set(entity, eid)
        data.entities[eid] = getComponent(entity, UUIDComponent)
      }
      const eid = eidMap.get(entity)!
      const entityData = {
        components: {},
        eid
      } as SerializedChunk['frames'][0][0]
      for (const componentSchema of schema) {
        const componentData = {
          props: {},
          buffers: {}
        } as SerializedChunk['frames'][0][0]['components'][0]
        if (hasComponent(entity, componentSchema.component)) {
          const component = componentSchema.component

          /** Properties */
          const comp = getComponent(entity, component)

          if (componentSchema.properties) {
            for (const prop of componentSchema.properties!) {
              // @TODO implement delta compression
              // const lastValue = data.frames[frame - 1]?.[eid]?.components?.props[prop]
              // const currentValue = getNestedProperty(comp, prop)
              // if (frame === 0 || lastValue !== currentValue) {
              //   componentData.props[prop] = currentValue
              // }
              componentData.props[prop] = getNestedProperty(comp, prop)
            }
          }

          /** Buffers */
          if (componentSchema.buffers) {
            for (const prop in componentSchema.buffers) {
              componentData.buffers[prop] = getNestedProperty(comp, prop)
            }
          }

          entityData.components[component.name] = componentData
        }
      }
      frameData.push(entityData)
    }

    data.frames.push(frameData)

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
      entities: {},
      frames: []
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

  const read = () => {
    const data = chunks[chunk]
    const frameData = data.frames[frame]
    for (const entityData of frameData) {
      if (!eidMap.has(entityData.eid)) {
        const eid = entityData.eid
        const uuid = data.entities[eid]
        console.log({ eid, uuid })
        if (UUIDComponent.entitiesByUUID.value[uuid]) {
          const entity = UUIDComponent.entitiesByUUID.value[uuid]
          eidMap.set(eid, entity)
        } else {
          const entity = createEntity()
          eidMap.set(eid, entity)
          setComponent(entity, UUIDComponent, data.entities[eid])
        }
      }
      const entity = eidMap.get(entityData.eid)!
      for (const componentName in entityData.components) {
        const componentData = entityData.components[componentName]
        const component = ComponentMap.get(componentName)!
        if (!hasComponent(entity, component)) {
          setComponent(entity, component)
        }
        const comp = getComponent(entity, component)
        for (const prop in componentData.props) {
          setNestedProperty(comp, prop, componentData.props[prop])
        }
        for (const prop in componentData.buffers) {
          setNestedProperty(comp, prop, componentData.buffers[prop])
        }
      }
    }
    frame++

    if (frame >= data.frames.length) {
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
