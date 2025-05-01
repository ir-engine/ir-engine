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

/**
 * MixerComponent
 *
 * A component that allows for interpolation between different property values based on a coordinate.
 * This is useful for animations, transitions, or any scenario where properties need to be
 * smoothly interpolated between different states.
 *
 * The mixer works by:
 * 1. Tracking properties from target entities/components
 * 2. Storing entries (keyframes) at specific coordinates
 * 3. Interpolating between entries based on the current coordinate
 * 4. Applying the interpolated values to the target properties
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

/**
 * Enum defining the types of values that can be mixed/interpolated
 */
enum MixableType {
  Number,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Color
}

/**
 * Union type of all possible mixable value types
 */
type Mixable = number | Vector2 | Vector3 | Vector4 | Color | Quaternion

/**
 * Interface defining the operations required for mixing/interpolating values
 * @template M The type of value being mixed
 */
type MixFunc<M> = {
  create: (a?: M) => M // Create a new instance with optional initial value
  lerp: (a: M, b: M, p: number) => M // Linearly interpolate between two values
  fromNumberList: (a: number[]) => M // Convert from serialized number array to type
  toNumberList: (a: M) => number[] // Convert from type to serialized number array
}

/**
 * Implementation of mixing functions for each supported type
 */
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
    lerp: (a: Quaternion, b: Quaternion, p) => a.clone().slerp(b, p), // Note: Uses slerp for quaternions
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

/**
 * Retrieves the schema for a property, supporting nested properties via dot notation
 * @param basisSchema The base schema to search in
 * @param propertyPath The property path (e.g. "position" or "nested.x")
 * @returns The schema for the property, or null if not found
 */
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

/**
 * Determines the appropriate MixableType for a given schema
 * @param schema The schema to analyze
 * @returns The determined MixableType
 */
const getMixableTypeFromSchema = (schema: any): MixableType => {
  if (!schema) return MixableType.Number

  const kind = schema[Kind]

  // Handle simple number type
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

    // Detect vector types by their properties
    if (props.includes('x') && props.includes('y')) {
      if (!props.includes('z')) return MixableType.Vector2
      if (!props.includes('w')) return MixableType.Vector3
      return MixableType.Vector4
    }

    // Detect color type by its properties
    if (props.includes('r') && props.includes('g') && props.includes('b')) {
      return MixableType.Color
    }
  }

  // Default to number if no specific type is detected
  return MixableType.Number
}

/**
 * Sets a value at a nested property path, creating intermediate objects as needed
 * @param obj The object to modify
 * @param path The property path (e.g. "position" or "nested.x")
 * @param value The value to set
 * @returns A new object with the updated property
 */
const setPropertyValue = (obj: any, path: string, value: Mixable): any => {
  const index = path.indexOf('.')
  if (index === -1) {
    // Base case: direct property
    return { ...obj, [path]: value }
  }

  // Recursive case: nested property
  const firstPart = path.substring(0, index)
  const restParts = path.substring(index + 1)
  return {
    ...obj,
    [firstPart]: setPropertyValue(obj[firstPart] || {}, restParts, value)
  }
}

/**
 * Creates a Property object for a specific property on a target entity/component
 * @param targetEntity The entity containing the property
 * @param targetComponent The component containing the property
 * @param propertyPath The path to the property
 * @returns A Property object or null if the property cannot be created
 */
const createProperty = (
  targetEntity: Entity | EntityUUID,
  targetComponent: AnyComponentWithID | string,
  propertyPath: string
): Property | null => {
  // Validate component
  const componentID = toComponentID(targetComponent)
  if (componentID == null) return null
  const Component = toComponent(targetComponent)
  if (Component == null) return null

  // Validate entity and component instance
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

/**
 * Internal state maintained by the MixerComponent
 */
type MixerState = {
  properties: Map<string, Property> // Map of property addresses to Property objects
  entriesByCoord: Map<number, [Entry, number]> // Map of coordinates to entries and their indices
  sortedEntries: [number, Entry][] // Cached sorted array of entries by coordinate
  needsUpdate: boolean // Flag indicating if sortedEntries needs updating
}

/**
 * Schema definition for the MixerComponent
 */
const schema = S.Object({
  state: S.NonSerialized(S.Type<MixerState>()), // Runtime state (not serialized)
  coord: S.Number(), // Current coordinate position
  properties: S.Array(S.String()), // Array of property addresses
  entries: S.Array(S.Tuple([S.Number(), S.Record(S.String(), S.Array(S.Number()))])) // Array of [coord, entry] tuples
})

/**
 * MixerComponent definition
 *
 * This component allows for interpolation between different property values based on a coordinate.
 * It can be used for animations, transitions, or any scenario where properties need to be
 * smoothly interpolated between different states.
 */
export const MixerComponent = defineComponent({
  name: 'MixerComponent',
  jsonID: 'IR_mixer',
  schema,

  /**
   * Reactor for the MixerComponent
   *
   * Handles initialization of the component state and triggers mixing when relevant properties change
   */
  reactor: ({ entity }: { entity: Entity }) => {
    const mixerComp = useComponent(entity, MixerComponent)

    // Initialize component state on first render
    useEffect(() => {
      if (mixerComp.state.value != null) return

      // Create property map from serialized property addresses
      const properties = new Map<string, Property>(
        mixerComp.properties.value
          .map((address: string): [string, Property] | null => {
            const [entityUUID, componentID, propertyPath] = unpackAddress(address)
            const property = createProperty(entityUUID, componentID, propertyPath)
            return property == null ? null : [address, property]
          })
          .filter((p) => p != null) // TODO: address missing properties somehow
      )

      // Create entries map from serialized entries
      const compEntries = mixerComp.entries.value as [number, Entry][]
      const entriesByCoord = new Map<number, [Entry, number]>(
        compEntries.map(([coord, entry], index) => [coord, [entry, index]])
      )

      // Set initial state
      mixerComp.state.set({
        properties,
        entriesByCoord,
        sortedEntries: [],
        needsUpdate: true
      })
    }, [])

    // Trigger mixing when relevant properties change
    useEffect(() => {
      MixerComponent.mix(entity)
    }, [mixerComp.coord, mixerComp.properties, mixerComp.entries, mixerComp.state])

    return null
  },

  /**
   * Applies the mixed values at the current coordinate to the target properties
   * @param mixerEntity The entity with the MixerComponent
   */
  mix: (mixerEntity: Entity): void => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const mixed = MixerComponent.getMixedEntry(mixerEntity, mixerComp.coord)

    // Group properties by entity and component to minimize setComponent calls
    const updates = new Map<EntityUUID, Map<string, any>>()

    // Process each property
    for (const [propertyAddress, property] of mixerComp.state.properties) {
      const {
        type,
        address: [entityUUID, componentID, propertyPath]
      } = property
      const mixedValue = mixFuncs[type].fromNumberList(mixed[propertyAddress])

      // Organize updates by entity and component
      if (!updates.has(entityUUID)) {
        updates.set(entityUUID, new Map())
      }
      const entityUpdates = updates.get(entityUUID)!
      if (!entityUpdates.has(componentID)) {
        entityUpdates.set(componentID, {})
      }

      // Build the updated component data
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

  /**
   * Gets the interpolated entry at the specified coordinate
   * @param mixerEntity The entity with the MixerComponent
   * @param coord The coordinate to get the mixed entry for
   * @returns An entry with interpolated values
   */
  getMixedEntry: (mixerEntity: Entity, coord: number): Entry => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)

    // Update sorted entries cache if needed
    if (mixerComp.state.needsUpdate) {
      mixerComp.state.sortedEntries = mixerComp.entries.toSorted(([aCoord], [bCoord]) => aCoord - bCoord)
      mixerComp.state.needsUpdate = false
    }
    const sortedEntries = mixerComp.state.sortedEntries

    // Handle edge cases
    if (sortedEntries.length === 0) return MixerComponent.getDefaultEntry(mixerEntity)
    if (sortedEntries.length === 1)
      return Object.fromEntries(Object.entries(sortedEntries[0][1]).map(([key, value]) => [key, [...value]]))

    // Find the entries to interpolate between using binary search
    const lastCoord = sortedEntries.length - 1
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

    // Get the entries and calculate interpolation factor
    const [fromCoord, fromEntry] = sortedEntries[from]
    const [toCoord, toEntry] = sortedEntries[to]
    const p = from === to ? 1 : (coord - fromCoord) / (toCoord - fromCoord)

    // Interpolate each property
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

  /**
   * Adds a property to be tracked by the mixer
   * @param mixerEntity The entity with the MixerComponent
   * @param targetEntity The entity containing the property to track
   * @param targetComponent The component containing the property to track
   * @param propertyPath The path to the property to track
   * @returns A function to set values for this property in entries, or null if the property couldn't be added
   */
  addProperty: (
    mixerEntity: Entity,
    targetEntity: Entity | EntityUUID,
    targetComponent: AnyComponentWithID | string,
    propertyPath: string
  ) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)

    // Check if property is already tracked
    const packedAddress = packAddress(targetEntity, targetComponent, propertyPath)
    if (mixerComp.state.properties.has(packedAddress)) {
      return MixerComponent.propertySetter(mixerEntity, targetEntity, targetComponent, propertyPath)
    }

    // Create the property
    const property = createProperty(targetEntity, targetComponent, propertyPath)
    if (property == null) return null

    // Add to tracked properties
    mixerComp.state.properties.set(packedAddress, property)
    mixerComp.properties.push(packedAddress)

    // Initialize property in all existing entries
    for (const [_coord, entry] of mixerComp.entries) {
      entry[packedAddress] = mixFuncs[property.type].toNumberList(mixFuncs[property.type].create())
    }

    return MixerComponent.propertySetter(mixerEntity, targetEntity, targetComponent, propertyPath)
  },

  /**
   * Creates a function that generates entry data for a specific property
   * @param mixerEntity The entity with the MixerComponent
   * @param targetEntity The entity containing the property
   * @param targetComponent The component containing the property
   * @param propertyPath The path to the property
   * @returns A function that takes a value and returns entry data for the property, or null if the property isn't tracked
   */
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

  /**
   * Removes a property from being tracked by the mixer
   * @param mixerEntity The entity with the MixerComponent
   * @param targetEntity The entity containing the property
   * @param targetComponent The component containing the property
   * @param propertyPath The path to the property
   */
  removeProperty: (
    mixerEntity: Entity,
    targetEntity: Entity | EntityUUID,
    targetComponent: AnyComponentWithID | string,
    propertyPath: string
  ) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const packedAddress = packAddress(targetEntity, targetComponent, propertyPath)

    if (!mixerComp.state.properties.has(packedAddress)) return

    // Remove from tracked properties
    mixerComp.state.properties.delete(packedAddress)
    mixerComp.properties = mixerComp.properties.filter((p) => p !== packedAddress)
  },

  /**
   * Gets an entry at a specific coordinate
   * @param mixerEntity The entity with the MixerComponent
   * @param coord The coordinate to get the entry for
   * @returns The entry at the coordinate, or null if none exists
   */
  getEntry: (mixerEntity: Entity, coord: number): Entry | null => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    return mixerComp.state.entriesByCoord.get(coord)?.[0] ?? null
  },

  /**
   * Creates a default entry with default values for all tracked properties
   * @param mixerEntity The entity with the MixerComponent
   * @returns A new entry with default values
   */
  getDefaultEntry: (mixerEntity: Entity): Entry => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    return Object.fromEntries(
      mixerComp.state.properties
        .entries()
        .map(([propertyAddress, { type }]) => [propertyAddress, mixFuncs[type].toNumberList(mixFuncs[type].create())])
    )
  },

  /**
   * Sets an entry at a specific coordinate, overwriting any existing entry
   * @param mixerEntity The entity with the MixerComponent
   * @param coord The coordinate to set the entry at
   * @param entry The entry data (partial, will be merged with defaults)
   * @returns The complete entry that was set
   */
  setEntry: (mixerEntity: Entity, coord: number, entry: Entry): Entry => {
    // Merge with default values for any unspecified properties
    entry = { ...MixerComponent.getDefaultEntry(mixerEntity), ...entry }
    const mixerComp = getComponent(mixerEntity, MixerComponent)

    // Get existing entry index or use the end of the array
    const index = mixerComp.state.entriesByCoord.get(coord)?.[1] ?? mixerComp.entries.length

    // Update the entry
    mixerComp.state.entriesByCoord.set(coord, [entry, index])
    mixerComp.entries[index] = [coord, entry]
    mixerComp.state.needsUpdate = true
    return entry
  },

  /**
   * Appends to an existing entry or creates a new one with interpolated values
   * @param mixerEntity The entity with the MixerComponent
   * @param coord The coordinate to append at
   * @param entry The entry data to append (partial)
   * @returns The complete entry after appending
   */
  appendEntry: (mixerEntity: Entity, coord: number, entry: Entry): Entry => {
    // Get interpolated values at this coordinate and merge with provided values
    return MixerComponent.setEntry(mixerEntity, coord, {
      ...MixerComponent.getMixedEntry(mixerEntity, coord),
      ...entry
    })
  },

  /**
   * Deletes an entry at a specific coordinate
   * @param mixerEntity The entity with the MixerComponent
   * @param coord The coordinate of the entry to delete
   */
  deleteEntry: (mixerEntity: Entity, coord: number) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const index = mixerComp.state.entriesByCoord.get(coord)?.[1]
    if (index == null) return

    // Remove from entriesByCoord map
    mixerComp.state.entriesByCoord.delete(coord)

    // Remove from entries array
    if (index === mixerComp.entries.length - 1) {
      // If it's the last entry, just pop it
      mixerComp.entries.pop()
    } else {
      // Otherwise, move the last entry to this position to avoid holes
      mixerComp.entries[index] = mixerComp.entries.pop()!
      // Update the index in entriesByCoord
      mixerComp.state.entriesByCoord.set(mixerComp.entries[index][0], [mixerComp.entries[index][1], index])
    }

    mixerComp.state.needsUpdate = true
  }
})
