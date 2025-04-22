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
import { quat, vec2, vec3, vec4 } from 'gl-matrix'
import { useEffect } from 'react'

enum MixableType {
  Number,
  Vector2,
  Vector3,
  Vector4,
  Quaternion
}

type Mixable = number | vec2 | vec3 | vec4 | quat

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
    create: (a?: number[]) => (a == null ? vec2.create() : vec2.fromValues(...(a as [number, number]))),
    lerp: (a: vec2, b: vec2, p) => vec2.lerp(vec2.create(), a, b, p),
    fromNumberList: (a: number[]) => vec2.fromValues(...(a as [number, number])),
    toNumberList: (a: vec2) => [...a]
  },
  [MixableType.Vector3]: {
    create: (a?: number[]) => (a == null ? vec3.create() : vec3.fromValues(...(a as [number, number, number]))),
    lerp: (a: vec3, b: vec3, p) => vec3.lerp(vec3.create(), a, b, p),
    fromNumberList: (a: number[]) => vec3.fromValues(...(a as [number, number, number])),
    toNumberList: (a: vec3) => [...a]
  },
  [MixableType.Vector4]: {
    create: (a?: number[]) => (a == null ? vec4.create() : vec4.fromValues(...(a as [number, number, number, number]))),
    lerp: (a: vec4, b: vec4, p) => vec4.lerp(vec4.create(), a, b, p),
    fromNumberList: (a: number[]) => vec4.fromValues(...(a as [number, number, number, number])),
    toNumberList: (a: vec4) => [...a]
  },
  [MixableType.Quaternion]: {
    create: (a?: number[]) => (a == null ? quat.create() : quat.fromValues(...(a as [number, number, number, number]))),
    lerp: (a: quat, b: quat, p) => quat.lerp(quat.create(), a, b, p),
    fromNumberList: (a: number[]) => quat.fromValues(...(a as [number, number, number, number])),
    toNumberList: (a: quat) => [...a]
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

const createProperty = (
  targetEntity: Entity | EntityUUID,
  targetComponent: AnyComponentWithID | string,
  propertyPath: string
): Property | null => {
  const componentID = toComponentID(targetComponent)
  if (componentID == null) return null
  const Component = toComponent(targetComponent)
  if (Component == null) return null

  if (propertyPath.includes('.')) {
    console.warn('MixerComponent does not support nested properties yet.')
    return null
  }

  const propertySchema = Component.schema.properties[propertyPath] // TODO: support properties nestled in schema

  if (propertySchema == null) return null
  const entity = toEntity(targetEntity)
  if (entity == null) return null
  const component = getComponent(entity, Component)
  if (component == null) return null
  const type = MixableType.Number // TODO: pull from propertySchema
  return {
    type,
    address: [toEntityUUID(targetEntity), componentID, propertyPath]
  }
}

type MixerState = {
  properties: Map<string, Property>
  entriesByCoord: Map<number, [Entry, number]>
  sortedEntries: [number, Entry][]
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

  reactor: (props: { mixerEntity: Entity }) => {
    const entity = props.mixerEntity
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
      const sortedEntries = compEntries.toSorted(([aCoord], [bCoord]) => aCoord - bCoord)
      mixerComp.state.set({ properties, entriesByCoord, sortedEntries })
    }, [])

    useEffect(() => {
      const compEntries = mixerComp.entries.value as [number, Entry][]
      mixerComp.state.sortedEntries.set(compEntries.toSorted(([aCoord], [bCoord]) => aCoord - bCoord))
    }, [mixerComp.entries])

    useEffect(() => {
      MixerComponent.mix(entity)
    }, [mixerComp.coord, mixerComp.properties, mixerComp.entries, mixerComp.state])

    return null
  },

  mix: (mixerEntity: Entity): void => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const mixed = MixerComponent.getMixedEntry(mixerEntity, mixerComp.coord)

    for (const [
      propertyAddress,
      {
        type,
        address: [entityUUID, componentID, propertyPath]
      }
    ] of mixerComp.state.properties) {
      const entity = UUIDComponent.getEntityByUUID(entityUUID)
      setComponent(entity, ComponentJSONIDMap.get(componentID)!, {
        [propertyPath]: mixed[propertyAddress] // TODO: support properties nestled in schema
      })
    }
  },

  getMixedEntry: (mixerEntity: Entity, coord: number): Entry => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const sortedEntries = mixerComp.state.sortedEntries
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
    const from = mid,
      to = Math.min(lastCoord, from + 1)
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
        return [propertyAddress, value]
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

    for (const entry of mixerComp.entries) {
      entry[packedAddress] = mixFuncs[property.type].create()
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

  setEntry: (mixerEntity: Entity, coord: number, entry: Entry): Entry => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const index = mixerComp.state.entriesByCoord.get(coord)?.[1] ?? mixerComp.entries.length
    mixerComp.state.entriesByCoord.set(coord, [entry, index])
    mixerComp.entries[index] = [coord, entry]
    return entry
  },

  appendEntry: (mixerEntity: Entity, coord: number, entry: Entry) => {
    MixerComponent.setEntry(mixerEntity, coord, {
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
  }
})
