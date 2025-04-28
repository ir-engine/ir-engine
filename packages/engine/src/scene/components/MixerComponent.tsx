/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

import {
  Component,
  ComponentJSONIDMap,
  defineComponent,
  Entity,
  EntityUUID,
  getComponent,
  S,
  setComponent,
  useComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { Kind } from '@ir-engine/ecs/src/schemas/JSONSchemaTypes'
import { useEffect } from 'react'
import { Color, Quaternion, Vector2, Vector3, Vector4 } from 'three'

enum MixableType {
  Number,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Color
}

type Mixable = number | Vector2 | Vector3 | Vector4 | Color | Quaternion

type MixFunc<M> = {
  create: (a?: M) => M
  lerp: (a: M, b: M, p: number) => M
  fromNumberList: (a: number[]) => M
  toNumberList: (a: M) => number[]
}
const mixFuncs: Record<MixableType, MixFunc<any>> = {
  [MixableType.Number]: {
    create: (a) => a ?? 0,
    lerp: (a: number, b: number, p) => a * (1 - p) + b * p,
    fromNumberList: (a: number[]) => a[0],
    toNumberList: (a: number) => [a]
  },
  [MixableType.Vector2]: {
    create: (a?: number[]) => new Vector2(...(a ?? [])),
    lerp: (a: Vector2, b: Vector2, p) => a.clone().lerp(b, p),
    fromNumberList: (a: number[]) => new Vector2(...a),
    toNumberList: (a: Vector2) => [...a]
  },
  [MixableType.Vector3]: {
    create: (a?: number[]) => new Vector3(...(a ?? [])),
    lerp: (a: Vector3, b: Vector3, p) => a.clone().lerp(b, p),
    fromNumberList: (a: number[]) => new Vector3(...a),
    toNumberList: (a: Vector3) => [...a]
  },
  [MixableType.Vector4]: {
    create: (a?: number[]) => new Vector4(...(a ?? [])),
    lerp: (a: Vector4, b: Vector4, p) => a.clone().lerp(b, p),
    fromNumberList: (a: number[]) => new Vector4(...a),
    toNumberList: (a: Vector4) => [...a]
  },
  [MixableType.Color]: {
    create: (a?: number[]) => new Color(...(a ?? [])),
    lerp: (a: Color, b: Color, p) => a.clone().lerp(b, p),
    fromNumberList: (a: number[]) => new Color(...a),
    toNumberList: (a: Color) => [...a]
  },
  [MixableType.Quaternion]: {
    create: (a?: number[]) => new Quaternion(...(a ?? [])),
    lerp: (a: Quaternion, b: Quaternion, p) => a.clone().slerp(b, p),
    fromNumberList: (a: number[]) => new Quaternion(...a),
    toNumberList: (a: Quaternion) => [...a]
  }
}

type AnyComponent = Component<any, any, any, any, any, any>
type AnyComponentWithID = AnyComponent & { jsonID: string }

const toEntityUUID = (entity: Entity | EntityUUID): EntityUUID =>
  typeof entity === 'string' ? entity : getComponent(entity, UUIDComponent)
const toEntity = (entity: Entity | EntityUUID): Entity =>
  typeof entity === 'string' ? UUIDComponent.getEntityByUUID(entity) : entity

const toComponentID = (targetComponent: AnyComponentWithID | string): string | undefined =>
  typeof targetComponent === 'string' ? targetComponent : targetComponent.jsonID
const toComponent = (targetComponent: AnyComponentWithID | string): AnyComponent | undefined =>
  typeof targetComponent === 'string' ? ComponentJSONIDMap.get(targetComponent) : targetComponent

type PropertyAddress = [EntityUUID, string, string]

const packAddress = (
  targetEntity: Entity | EntityUUID,
  targetComponent: AnyComponentWithID | string,
  propertyPath: string
): string => `${toEntityUUID(targetEntity)}::${toComponentID(targetComponent)}::${propertyPath}`

const unpackAddress = (packedAddress: string): PropertyAddress =>
  packedAddress.split('::') as [EntityUUID, string, string]

type Entry = Record<string, number[]>
type Property = { type: MixableType; address: PropertyAddress }

const getPropertySchema = (basisSchema: any, propertyPath: string): any => {
  if (!propertyPath.includes('.')) {
    return basisSchema.properties?.[propertyPath]
  }

  const parts = propertyPath.split('.')
  let schema = basisSchema
  for (const part of parts) {
    if (schema.properties?.[part]) {
      schema = schema.properties[part]
    } else if (schema[Kind] === 'Object' || schema[Kind] === 'Class') {
      schema = schema.properties?.[part]
    } else {
      return null
    }

    if (!schema) return null
  }

  return schema
}

const getMixableTypeFromSchema = (schema: any): MixableType => {
  if (!schema) return MixableType.Number

  const kind = schema[Kind]

  if (kind === 'Number') {
    return MixableType.Number
  }

  // Check for Vector types from T.Vec2, T.Vec3, etc.
  if (kind === 'Class' || kind === 'SerializedClass') {
    switch (schema.options?.id) {
      case 'Vec2':
        return MixableType.Vector2
      case 'Vec3':
        return MixableType.Vector3
      case 'Vec4':
        return MixableType.Vector4
      case 'Color':
        return MixableType.Color
      case 'Quaternion':
        return MixableType.Quaternion
    }
  }

  // Check properties for vector-like structure
  if (schema.properties) {
    const props = Object.keys(schema.properties)

    if (props.includes('x') && props.includes('y')) {
      if (!props.includes('z')) return MixableType.Vector2
      if (!props.includes('w')) return MixableType.Vector3
      return MixableType.Vector4
    }

    if (props.includes('r') && props.includes('g') && props.includes('b')) {
      return MixableType.Color
    }
  }

  return MixableType.Number
}

const setPropertyValue = (obj: any, path: string, value: Mixable): any => {
  const index = path.indexOf('.')
  if (index === -1) {
    return { ...obj, [path]: value }
  }
  const firstPart = path.substring(0, index)
  const restParts = path.substring(index + 1)
  return {
    ...obj,
    [firstPart]: setPropertyValue(obj[firstPart] || {}, restParts, value)
  }
}

const createProperty = (
  targetEntity: Entity | EntityUUID,
  targetComponent: AnyComponentWithID | string,
  propertyPath: string
): Property | null => {
  const componentID = toComponentID(targetComponent)
  if (componentID == null) return null
  const Component = toComponent(targetComponent)
  if (Component == null) return null

  const entity = toEntity(targetEntity)
  if (entity == null) return null
  const component = getComponent(entity, Component)
  if (component == null) return null

  // Get the property schema, supporting nested properties
  const propertySchema = getPropertySchema(Component.schema, propertyPath)
  if (propertySchema == null) return null

  // Determine the mixable type from the schema
  const type = getMixableTypeFromSchema(propertySchema)

  return {
    type,
    address: [toEntityUUID(targetEntity), componentID, propertyPath]
  }
}

type MixerState = {
  properties: Map<string, Property>
  entriesByCoord: Map<number, [Entry, number]>
  sortedEntries: [number, Entry][]
  needsUpdate: boolean
}

const schema = S.Object({
  state: S.NonSerialized(S.Type<MixerState>()),
  coord: S.Number(),
  properties: S.Array(S.String()),
  entries: S.Array(S.Tuple([S.Number(), S.Record(S.String(), S.Array(S.Number()))]))
})

export const MixerComponent = defineComponent({
  name: 'MixerComponent',
  jsonID: 'IR_mixer',
  schema,

  reactor: ({ entity }: { entity: Entity }) => {
    const mixerComp = useComponent(entity, MixerComponent)

    useEffect(() => {
      if (mixerComp.state.value != null) return

      const properties = new Map<string, Property>(
        mixerComp.properties.value
          .map((address: string): [string, Property] | null => {
            const [entityUUID, componentID, propertyPath] = unpackAddress(address)
            const property = createProperty(entityUUID, componentID, propertyPath)
            return property == null ? null : [address, property]
          })
          .filter((p) => p != null) // TODO: address missing properties somehow
      )

      const compEntries = mixerComp.entries.value as [number, Entry][]
      const entriesByCoord = new Map<number, [Entry, number]>(
        compEntries.map(([coord, entry], index) => [coord, [entry, index]])
      )
      mixerComp.state.set({
        properties,
        entriesByCoord,
        sortedEntries: [],
        needsUpdate: true
      })
    }, [])

    useEffect(() => {
      MixerComponent.mix(entity)
    }, [mixerComp.coord, mixerComp.properties, mixerComp.entries, mixerComp.state])

    return null
  },

  mix: (mixerEntity: Entity): void => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const mixed = MixerComponent.getMixedEntry(mixerEntity, mixerComp.coord)

    // Group properties by entity and component to minimize setComponent calls
    const updates = new Map<EntityUUID, Map<string, any>>()

    for (const [propertyAddress, property] of mixerComp.state.properties) {
      const {
        type,
        address: [entityUUID, componentID, propertyPath]
      } = property
      const mixedValue = mixFuncs[type].fromNumberList(mixed[propertyAddress])

      if (!updates.has(entityUUID)) {
        updates.set(entityUUID, new Map())
      }
      const entityUpdates = updates.get(entityUUID)!
      if (!entityUpdates.has(componentID)) {
        entityUpdates.set(componentID, {})
      }

      const componentUpdate = entityUpdates.get(componentID)
      const updatedComponent = setPropertyValue(componentUpdate, propertyPath, mixedValue)
      updates.get(entityUUID)!.set(componentID, updatedComponent)
    }

    // Apply all updates
    for (const [entityUUID, componentUpdates] of updates) {
      const entity = UUIDComponent.getEntityByUUID(entityUUID)
      for (const [componentID, update] of componentUpdates) {
        setComponent(entity, ComponentJSONIDMap.get(componentID)!, update)
      }
    }
  },

  getMixedEntry: (mixerEntity: Entity, coord: number): Entry => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    if (mixerComp.state.needsUpdate) {
      mixerComp.state.sortedEntries = mixerComp.entries.toSorted(([aCoord], [bCoord]) => aCoord - bCoord)
      mixerComp.state.needsUpdate = false
    }
    const sortedEntries = mixerComp.state.sortedEntries

    if (sortedEntries.length === 0) return MixerComponent.getDefaultEntry(mixerEntity)
    if (sortedEntries.length === 1)
      return Object.fromEntries(Object.entries(sortedEntries[0][1]).map(([key, value]) => [key, [...value]]))

    const lastCoord = sortedEntries.length - 1
    // binary search
    let left = 0,
      right = lastCoord,
      mid = 0
    while (left <= right) {
      mid = Math.floor((left + right) / 2)
      const midCoord = sortedEntries[mid][0]
      if (midCoord < coord) {
        left = mid + 1
      } else if (midCoord > coord) {
        right = mid - 1
      } else {
        break
      }
    }
    if (sortedEntries[mid][0] > coord) {
      mid--
    }
    const from = mid
    const to = Math.min(lastCoord, from + 1)

    const [fromCoord, fromEntry] = sortedEntries[from]
    const [toCoord, toEntry] = sortedEntries[to]
    const p = from === to ? 1 : (coord - fromCoord) / (toCoord - fromCoord)

    return Object.fromEntries(
      mixerComp.state.properties.entries().map(([propertyAddress, { type }]) => {
        const [fromValue, toValue] = [fromEntry[propertyAddress], toEntry[propertyAddress]]
        const value =
          fromValue == null || toValue == null
            ? mixFuncs[type].create(fromValue ?? toValue)
            : mixFuncs[type].lerp(fromValue, toValue, p)
        return [propertyAddress, mixFuncs[type].toNumberList(value)]
      })
    )
  },

  addProperty: (
    mixerEntity: Entity,
    targetEntity: Entity | EntityUUID,
    targetComponent: AnyComponentWithID | string,
    propertyPath: string
  ) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)

    const packedAddress = packAddress(targetEntity, targetComponent, propertyPath)
    if (mixerComp.state.properties.has(packedAddress)) {
      return MixerComponent.propertySetter(mixerEntity, targetEntity, targetComponent, propertyPath)
    }

    const property = createProperty(targetEntity, targetComponent, propertyPath)
    if (property == null) return null

    mixerComp.state.properties.set(packedAddress, property)
    mixerComp.properties.push(packedAddress)

    for (const [_coord, entry] of mixerComp.entries) {
      entry[packedAddress] = mixFuncs[property.type].toNumberList(mixFuncs[property.type].create())
    }

    return MixerComponent.propertySetter(mixerEntity, targetEntity, targetComponent, propertyPath)
  },

  propertySetter: (
    mixerEntity: Entity,
    targetEntity: Entity | EntityUUID,
    targetComponent: AnyComponentWithID | string,
    propertyPath: string
  ): ((value: Mixable) => Entry) | null => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const packedAddress = packAddress(targetEntity, targetComponent, propertyPath)

    const property = mixerComp.state.properties.get(packedAddress)
    if (property == null) return null

    return (value: Mixable) => ({ [packedAddress]: mixFuncs[property.type].toNumberList(value) })
  },

  removeProperty: (
    mixerEntity: Entity,
    targetEntity: Entity | EntityUUID,
    targetComponent: AnyComponentWithID | string,
    propertyPath: string
  ) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const packedAddress = packAddress(targetEntity, targetComponent, propertyPath)

    if (!mixerComp.state.properties.has(packedAddress)) return

    mixerComp.state.properties.delete(packedAddress)
    mixerComp.properties = mixerComp.properties.filter((p) => p !== packedAddress)
  },

  getEntry: (mixerEntity: Entity, coord: number): Entry | null => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    return mixerComp.state.entriesByCoord.get(coord)?.[0] ?? null
  },

  getDefaultEntry: (mixerEntity: Entity): Entry => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    return Object.fromEntries(
      mixerComp.state.properties
        .entries()
        .map(([propertyAddress, { type }]) => [propertyAddress, mixFuncs[type].toNumberList(mixFuncs[type].create())])
    )
  },

  setEntry: (mixerEntity: Entity, coord: number, entry: Entry): Entry => {
    entry = { ...MixerComponent.getDefaultEntry(mixerEntity), ...entry }
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const index = mixerComp.state.entriesByCoord.get(coord)?.[1] ?? mixerComp.entries.length
    mixerComp.state.entriesByCoord.set(coord, [entry, index])
    mixerComp.entries[index] = [coord, entry]
    mixerComp.state.needsUpdate = true
    return entry
  },

  appendEntry: (mixerEntity: Entity, coord: number, entry: Entry): Entry => {
    return MixerComponent.setEntry(mixerEntity, coord, {
      ...MixerComponent.getMixedEntry(mixerEntity, coord),
      ...entry
    })
  },

  deleteEntry: (mixerEntity: Entity, coord: number) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const index = mixerComp.state.entriesByCoord.get(coord)?.[1]
    if (index == null) return
    mixerComp.state.entriesByCoord.delete(coord)
    if (index === mixerComp.entries.length - 1) {
      mixerComp.entries.pop()
    } else {
      mixerComp.entries[index] = mixerComp.entries.pop()!
      mixerComp.state.entriesByCoord.set(mixerComp.entries[index][0], [mixerComp.entries[index][1], index])
    }
    mixerComp.state.needsUpdate = true
  }
})
