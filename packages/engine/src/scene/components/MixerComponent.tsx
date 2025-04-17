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
  ComponentMap,
  createEntity,
  defineComponent,
  Entity,
  EntityUUID,
  getComponent,
  S,
  setComponent,
  useComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
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

type Entry = Record<string, number[]>
type Property = { type: MixableType; ref: [WeakRef<any>, string] }

type MixerState = {
  properties: Map<string, Property>
  entriesByCoord: Map<number, Entry>
  sortedEntries: [number, Entry][]
}

const schema = S.Object({
  state: S.NonSerialized(S.Type<MixerState>()),
  coord: S.Number(),
  properties: S.Array(S.String()),
  entries: S.Array(S.Tuple([S.Number(), S.Record(S.String(), S.Array(S.Number()))]))
})

type PropertyAddress = [EntityUUID, string, string]

const packAddress = (entityUUID: EntityUUID, componentName: string, propertyName: string): string =>
  `${entityUUID}::${componentName}::${propertyName}`

const unpackAddress = (packedAddress: string): PropertyAddress =>
  packedAddress.split('::') as [EntityUUID, string, string]

const createProperty = (entityUUID: EntityUUID, componentName: string, propertyName: string): Property | null => {
  const Component = ComponentMap.get(componentName)
  if (Component == null) return null
  const propertySchema = Component.schema?.properties?.[propertyName]
  if (propertySchema == null) return null
  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  if (entity == null) return null
  const component = getComponent(entity, Component)
  if (component == null) return null
  const type = MixableType.Number // TODO: pull from propertySchema
  return {
    type,
    ref: [new WeakRef(component), propertyName]
  }
}

const MixerComponent = defineComponent({
  name: 'MixerComponent',
  jsonID: 'IR_mixer',
  schema,

  reactor: (props: { entity: Entity }) => {
    const entity = props.entity
    const comp = useComponent(entity, MixerComponent)

    useEffect(() => {
      if (comp.state.value != null) return

      const properties = new Map<string, Property>(
        comp.properties.value
          .map((address: string): [string, Property] | null => {
            const [entityUUID, componentName, propertyName] = unpackAddress(address)
            const property = createProperty(entityUUID, componentName, propertyName)
            return property == null ? null : [address, property]
          })
          .filter((p) => p != null)
      )

      const compEntries = comp.entries.value as [number, Entry][]

      comp.state.set({
        properties,
        entriesByCoord: new Map(compEntries),
        sortedEntries: compEntries.toSorted(([aCoord], [bCoord]) => aCoord - bCoord)
      })
    }, [])

    useEffect(() => {
      MixerComponent.mix(entity)
    }, [comp.coord, comp.properties, comp.entries, comp.state])

    return null
  },

  mix: (entity: Entity, coord: number = NaN): void => {
    const comp = getComponent(entity, MixerComponent)

    if (isNaN(coord)) {
      coord = comp.coord
    }

    const mixed = MixerComponent.getMixed(entity, coord)

    for (const [
      propertyAddress,
      {
        type,
        ref: [componentRef, propertyName]
      }
    ] of comp.state.properties) {
      const component = componentRef.deref()
      if (component == null || component[propertyName] == null) {
        continue
        // TODO: gracefully handle unresolved reference. This can happen at any time.
      }
      const value = mixed[propertyAddress]
      component[propertyName].set(mixFuncs[type].fromNumberList(value))
    }
  },

  getMixed: (entity: Entity, coord: number): Entry => {
    const comp = getComponent(entity, MixerComponent)
    const sortedEntries = comp.state.sortedEntries
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
      comp.state.properties.entries().map(([propertyAddress, { type }]) => {
        const [fromValue, toValue] = [fromEntry[propertyAddress], toEntry[propertyAddress]]
        const value =
          fromValue == null || toValue == null
            ? mixFuncs[type].create(fromValue ?? toValue)
            : mixFuncs[type].lerp(fromValue, toValue, p)
        return [propertyAddress, value]
      })
    )
  },

  addProperty: (entity: Entity, entityUUID: EntityUUID, componentName: string, propertyName: string) => {
    const comp = getComponent(entity, MixerComponent)

    const packedAddress = packAddress(entityUUID, componentName, propertyName)
    if (comp.state.properties.has(packedAddress)) {
      return MixerComponent.propertySetter(entity, entityUUID, componentName, propertyName)
    }

    const property = createProperty(entityUUID, componentName, propertyName)
    if (property == null) return null

    comp.state.properties.set(packedAddress, property)
    comp.properties.push(packedAddress)

    for (const entry of comp.entries) {
      entry[packedAddress] = mixFuncs[property.type].create()
    }

    return MixerComponent.propertySetter(entity, entityUUID, componentName, propertyName)
  },

  propertySetter: (
    entity: Entity,
    entityUUID: EntityUUID,
    componentName: string,
    propertyName: string
  ): ((value: Mixable) => Entry) | null => {
    const comp = getComponent(entity, MixerComponent)
    const packedAddress = packAddress(entityUUID, componentName, propertyName)

    const property = comp.state.properties.get(packedAddress)
    if (property == null) return null

    return (value: Mixable) => ({ [packedAddress]: mixFuncs[property.type].toNumberList(value) })
  },

  removeProperty: (entity: Entity, entityUUID: EntityUUID, componentName: string, propertyName: string) => {
    const comp = getComponent(entity, MixerComponent)
    const packedAddress = packAddress(entityUUID, componentName, propertyName)

    if (!comp.state.properties.has(packedAddress)) return

    comp.state.properties.delete(packedAddress)
    comp.properties = comp.properties.filter((p) => p !== packedAddress)
    comp.state.entriesByCoord.forEach((entry) => delete entry[packedAddress])
  }
})

{
  const e = createEntity()
  setComponent(e, TransformComponent)
  setComponent(e, MixerComponent)
  const comp = getComponent(e, MixerComponent)

  let rotationSet = MixerComponent.addProperty(e, getComponent(e, UUIDComponent), TransformComponent.name, 'rotation')
  rotationSet = MixerComponent.propertySetter(e, getComponent(e, UUIDComponent), TransformComponent.name, 'rotation')!
  comp.entries.push([
    0,
    {
      ...MixerComponent.getMixed(e, 0),
      ...rotationSet(quat.fromEuler(quat.create(), 0, Math.PI / 4, Math.PI / 3))
    }
  ])
  comp.entries.push([
    0.25,
    {
      ...MixerComponent.getMixed(e, 0.25),
      ...rotationSet(quat.fromEuler(quat.create(), 0, Math.PI / 3, Math.PI / 4))
    }
  ])
  comp.coord = 0.5
  MixerComponent.mix(e)
  MixerComponent.addProperty(e, getComponent(e, UUIDComponent), TransformComponent.name, 'position')
  MixerComponent.removeProperty(e, getComponent(e, UUIDComponent), TransformComponent.name, 'rotation')
}
