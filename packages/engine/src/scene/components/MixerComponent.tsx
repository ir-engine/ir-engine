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
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { quat, vec2, vec3, vec4 } from 'gl-matrix'
import { useEffect } from 'react'

enum MixerType {
  OneDimensional
}

enum MixableType {
  Number,
  Vector2,
  Vector3,
  Vector4,
  Quaternion
}

const getMixable = ([type, values]: [MixableType, number[]]): Mixable => {
  switch (type) {
    case MixableType.Number:
      return values[0]
    case MixableType.Vector2:
      return vec2.fromValues(...(values as [number, number]))
    case MixableType.Vector3:
      return vec3.fromValues(...(values as [number, number, number]))
    case MixableType.Vector4:
      return vec4.fromValues(...(values as [number, number, number, number]))
    case MixableType.Quaternion:
      return quat.fromValues(...(values as [number, number, number, number]))
  }
}

type MixerState = {
  propertyCache: Map<
    string,
    {
      funcs: MixFunc<any>
      ref?: [WeakRef<any>, string]
    }
  >
  entries: Map<MixCoord, [number, Entry]>
}

const prepComponent = (entity: Entity) => {
  const mixerComp = getComponent(entity, MixerComponent)!
  if (mixerComp.state == null) {
    const state: MixerState = {
      propertyCache: new Map(),
      entries: new Map()
    }

    mixerComp.properties.forEach((propertyAddress) => {
      const [entityUUID, componentName, propertyName] = unpackAddress(propertyAddress)
      const Component = ComponentMap.get(componentName)
      if (Component == null) {
        return
      }
      const component = findComponent(entityUUID, Component)
      if (component == null) {
        return
      }
      const typeName = 'number' // TODO: get type from schema
      state.propertyCache.set(propertyAddress, {
        funcs: mixFuncs[typeName],
        ref: [new WeakRef(component), propertyName]
      })
    })

    mixerComp.entries.forEach(([coord, entry], index) => {
      state.entries.set(coord as MixCoord, [
        index,
        Object.fromEntries(Object.entries(entry).map(([k, v]) => [k, getMixable(v)] as [string, Mixable]))
      ])
    })

    mixerComp.state = state
  }
  return mixerComp
}

const MixerComponent = defineComponent({
  name: 'MixerComponent',
  jsonID: 'IR_mixer',
  schema: S.Object({
    state: S.NonSerialized(S.Nullable(S.Type<MixerState>())),

    type: S.Enum(MixerType, MixerType.OneDimensional),
    coord: S.Array(S.Number()),

    properties: S.Array(S.String()),
    entries: S.Array(
      S.Tuple([
        S.Array(S.Number()),
        S.Record(S.String(), S.Tuple([S.Enum(MixableType, MixableType.Number), S.Array(S.Number())]))
      ])
    )
  }),

  reactor: () => {
    const entity = useEntityContext()
    const mixerComp = useComponent(entity, MixerComponent)
    mixerComp.type.set(MixerType.OneDimensional)

    useEffect(() => {
      // mixer.mix(mixerComp.coord.value[0])
    }, [mixerComp.coord, mixerComp.type, mixerComp.entries, mixerComp.state])

    return null
  }
})

type MixCoord = number | vec2 | vec3

type Mixable = number | vec2 | vec3 | vec4 | quat

// TODO: support mixing of 2, 3 or 4 weighted inputs
type MixFunc<M> = { create: (a?: M) => M; lerp: (a: M, b: M, p: number) => M }
const mixFuncs: Record<string, MixFunc<any>> = {
  number: { create: (a) => a ?? 0, lerp: (a: number, b: number, p) => a * (1 - p) + b * p },
  vec2: {
    create: (a?: vec2) => (a == null ? vec2.create() : vec2.clone(a)),
    lerp: (a: vec2, b: vec2, p) => vec2.lerp(vec2.create(), a, b, p)
  },
  vec3: {
    create: (a?: vec3) => (a == null ? vec3.create() : vec3.clone(a)),
    lerp: (a: vec3, b: vec3, p) => vec3.lerp(vec3.create(), a, b, p)
  },
  vec4: {
    create: (a?: vec4) => (a == null ? vec4.create() : vec4.clone(a)),
    lerp: (a: vec4, b: vec4, p) => vec4.lerp(vec4.create(), a, b, p)
  },
  quat: {
    create: (a?: quat) => (a == null ? quat.create() : quat.clone(a)),
    lerp: (a: quat, b: quat, p) => quat.lerp(quat.create(), a, b, p)
  }
}

type PropertyAddress = [EntityUUID, string, string]

const packAddress = (entityUUID: EntityUUID, componentName: string, propertyName: string) =>
  `${entityUUID}::${componentName}::${propertyName}`

const unpackAddress = (packedAddress: string) => packedAddress.split('::') as [EntityUUID, string, string]

const findComponent = (entityUUID: EntityUUID, Component: any) => {
  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  if (entity == null) {
    return null
  }
  return getComponent(entity, Component)
}

type Entry = Record<string, Mixable>

abstract class Mixer<C extends MixCoord> {
  protected entries: Map<C, Entry> = new Map()
  private propertyMixFuncs: Map<string, MixFunc<any>> = new Map()
  private propertyCache: Map<string, [WeakRef<any>, string]> = new Map()

  private isDirty = false

  addEntry(coord: C): Entry {
    if (this.entries.has(coord)) {
      return this.entries.get(coord)!
    }
    const entry: Entry = {}
    for (const [propertyName, { create, lerp }] of this.propertyMixFuncs) {
      const [fromProperties, toProperties, p] = this.getMix(coord)
      const [fromValue, toValue] = [fromProperties[propertyName], toProperties[propertyName]]
      const value = fromValue == null || toValue == null ? create(fromValue ?? toValue) : lerp(fromValue, toValue, p)
      entry[propertyName] = value
    }
    this.entries.set(coord, entry)
    this.isDirty = true
    return entry
  }

  getEntry(coord: C) {
    return this.entries.get(coord)
  }

  deleteEntry(coord: C) {
    this.isDirty ||= this.entries.delete(coord)
  }

  addProperty(entityUUID: EntityUUID, componentName: string, propertyName: string) {
    const Component = ComponentMap.get(componentName)
    if (Component == null) {
      return
    }
    const property = Component.schema!.properties![propertyName]
    if (property == null) {
      return
    }
    const typeName = 'number' // TODO: get type from schema

    const component = findComponent(entityUUID, Component)
    if (component == null) {
      return
    }
    const propertyAddress = packAddress(entityUUID, componentName, propertyName)
    if (this.propertyMixFuncs.has(propertyAddress)) {
      return
    }
    this.propertyMixFuncs.set(propertyAddress, mixFuncs[typeName])
    this.propertyCache.set(propertyAddress, [new WeakRef(component), propertyName])
    for (const entry of this.entries) {
      entry[propertyAddress] = mixFuncs[typeName].create()
    }
  }

  coords(): Iterable<C> {
    return this.entries.keys()
  }

  properties(): Iterable<string> {
    return this.propertyCache.keys()
  }

  setProperty(coord: C, entityUUID: EntityUUID, componentName: string, propertyName: string, value: Mixable) {
    if (!this.entries.has(coord)) {
      this.addEntry(coord)
    }

    const propertyAddress = packAddress(entityUUID, componentName, propertyName)
    if (!this.propertyMixFuncs.has(propertyAddress)) {
      this.addProperty(entityUUID, componentName, propertyName)
    }

    this.entries.get(coord)![propertyAddress] = value
  }

  deleteProperty(entityUUID: EntityUUID, componentName: string, propertyName: string) {
    const propertyAddress = packAddress(entityUUID, componentName, propertyName)
    if (!this.propertyMixFuncs.has(propertyAddress)) {
      return
    }
    this.propertyMixFuncs.delete(propertyAddress)
    this.propertyCache.delete(propertyAddress)
    for (const entry of this.entries) {
      delete entry[propertyAddress]
    }
  }

  protected update() {}

  protected getMix(coord: C): [Entry, Entry, number] {
    throw new Error('Method not implemented.')
  }

  public mix(coord: C): void {
    if (this.isDirty) {
      this.isDirty = false
      this.update()
    }

    const [fromProperties, toProperties, p] = this.getMix(coord)

    for (const [propertyAddress, { create, lerp }] of this.propertyMixFuncs) {
      const [componentRef, propertyName] = this.propertyCache.get(propertyAddress)!
      const component = componentRef.deref()
      if (component == null || component[propertyName] == null) {
        continue
        // TODO: gracefully handle unresolved reference. This can happen at any time.
      }
      const [fromValue, toValue] = [fromProperties[propertyAddress], toProperties[propertyAddress]]
      const value = fromValue == null || toValue == null ? create(fromValue ?? toValue) : lerp(fromValue, toValue, p)
      component[propertyName].set(value)
    }
  }
}

class NumMixer extends Mixer<number> {
  private sortedCoords: number[]

  protected update() {
    this.sortedCoords = [...this.entries.keys()].toSorted((a, b) => a - b)
  }

  protected getMix(coord: number): [Entry, Entry, number] {
    const coords = this.sortedCoords,
      lastCoord = coords.length - 1
    // binary search
    let left = 0,
      right = lastCoord,
      mid = 0
    while (left <= right) {
      mid = Math.floor((left + right) / 2)
      const midValue = coords[mid]
      if (midValue < coord) {
        left = mid + 1
      } else if (midValue > coord) {
        right = mid - 1
      } else {
        break
      }
    }
    if (coords[mid] > coord) {
      mid--
    }
    const from = mid,
      to = Math.min(lastCoord, from + 1)
    const fromCoord = coords[from]
    const toCoord = coords[to]
    const fromProperties = this.entries.get(fromCoord)!
    const toProperties = this.entries.get(toCoord)!
    const p = from === to ? 1 : (coord - fromCoord) / (toCoord - fromCoord)
    return [fromProperties, toProperties, p]
  }
}

const timeline = new NumMixer()

const e = createEntity()
setComponent(e, TransformComponent)
const address: PropertyAddress = [getComponent(e, UUIDComponent), TransformComponent.name, 'rotation']
timeline.addProperty(...address)
timeline.addEntry(0)
timeline.setProperty(0, ...address, quat.fromEuler(quat.create(), 0, Math.PI / 4, Math.PI / 3))
timeline.setProperty(1, ...address, quat.fromEuler(quat.create(), 0, Math.PI / 3, Math.PI / 4))
timeline.addEntry(0.25)
timeline.mix(0.5)
