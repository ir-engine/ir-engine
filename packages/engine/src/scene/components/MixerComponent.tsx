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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
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
  EntityID,
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
export type MixableType = 'number' | 'Vector2' | 'Vector3' | 'Vector4' | 'Color' | 'Quaternion'

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
  number: {
    create: (a) => a ?? 0,
    lerp: (a: number, b: number, p) => a * (1 - p) + b * p,
    fromNumberList: (a: number[]) => a[0],
    toNumberList: (a: number) => [a]
  },
  Vector2: {
    create: (a?: number[]) => new Vector2(...(a ?? [])),
    lerp: (a: Vector2, b: Vector2, p) => a.clone().lerp(b, p),
    fromNumberList: (a: number[]) => new Vector2(...a),
    toNumberList: (a: Vector2) => [...a]
  },
  Vector3: {
    create: (a?: number[]) => new Vector3(...(a ?? [])),
    lerp: (a: Vector3, b: Vector3, p) => a.clone().lerp(b, p),
    fromNumberList: (a: number[]) => new Vector3(...a),
    toNumberList: (a: Vector3) => [...a]
  },
  Vector4: {
    create: (a?: number[]) => new Vector4(...(a ?? [])),
    lerp: (a: Vector4, b: Vector4, p) => a.clone().lerp(b, p),
    fromNumberList: (a: number[]) => new Vector4(...a),
    toNumberList: (a: Vector4) => [...a]
  },
  Color: {
    create: (a?: number[]) => new Color(...(a ?? [])),
    lerp: (a: Color, b: Color, p) => a.clone().lerp(b, p),
    fromNumberList: (a: number[]) => new Color(...a),
    toNumberList: (a: Color) => [...a]
  },
  Quaternion: {
    create: (a?: number[]) => new Quaternion(...(a ?? [])),
    lerp: (a: Quaternion, b: Quaternion, p) => a.clone().slerp(b, p), // Note: Uses slerp for quaternions
    fromNumberList: (a: number[]) => new Quaternion(...a),
    toNumberList: (a: Quaternion) => [...a]
  }
}

type AnyComponent = Component<any, any, any, any, any, any>
type AnyComponentWithID = AnyComponent & { jsonID: string }

const toComponentID = (targetComponent: AnyComponentWithID | string): string | undefined =>
  typeof targetComponent === 'string' ? targetComponent : targetComponent.jsonID
const toComponent = (targetComponent: AnyComponentWithID | string): AnyComponent | undefined =>
  typeof targetComponent === 'string' ? ComponentJSONIDMap.get(targetComponent) : targetComponent

const packAddress = (
  targetEntityID: EntityID,
  targetComponent: AnyComponentWithID | string,
  propertyPath: string
): string => `/${targetEntityID}/${toComponentID(targetComponent)}/${propertyPath}`

type Entry = Record<string, number[]>

type Property = {
  entityID: EntityID
  componentID: string
  propertyPath: string
  type: MixableType
  address: string
}

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
  if (!schema) return 'number'

  const kind = schema[Kind]

  // Handle simple number type
  if (kind === 'Number') {
    return 'number'
  }

  // Check for Vector types from T.Vec2, T.Vec3, etc.
  if (kind === 'Class' || kind === 'SerializedClass') {
    switch (schema.options?.id) {
      case 'Vec2':
        return 'Vector2'
      case 'Vec3':
        return 'Vector3'
      case 'Vec4':
        return 'Vector4'
      case 'Color':
        return 'Color'
      case 'Quaternion':
        return 'Quaternion'
    }
  }

  // Check properties for vector-like structure
  if (schema.properties) {
    const props = Object.keys(schema.properties)

    // Detect vector types by their properties
    if (props.includes('x') && props.includes('y')) {
      if (!props.includes('z')) return 'Vector2'
      if (!props.includes('w')) return 'Vector3'
      return 'Vector4'
    }

    // Detect color type by its properties
    if (props.includes('r') && props.includes('g') && props.includes('b')) {
      return 'Color'
    }
  }

  // Default to number if no specific type is detected
  return 'number'
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
 * @param targetEntityID The entity containing the property
 * @param targetComponent The component containing the property
 * @param propertyPath The path to the property
 * @returns A Property object or null if the property cannot be created
 */
const createProperty = (
  mixerEntity: Entity,
  targetEntityID: EntityID,
  targetComponent: AnyComponentWithID | string,
  propertyPath: string
): Property | null => {
  // Validate component
  const componentID = toComponentID(targetComponent)
  if (componentID == null) return null
  const Component = toComponent(targetComponent)
  if (Component == null) return null

  // Validate entity and component instance
  const entity = UUIDComponent.getEntityFromSameSourceByID(mixerEntity, targetEntityID)
  if (entity == null) return null
  const component = getComponent(entity, Component)
  if (component == null) return null

  // Get the property schema, supporting nested properties
  const propertySchema = getPropertySchema(Component.schema, propertyPath)
  if (propertySchema == null) return null

  // Determine the mixable type from the schema
  const type = getMixableTypeFromSchema(propertySchema)

  const address = packAddress(targetEntityID, targetComponent, propertyPath)

  return {
    entityID: targetEntityID,
    componentID,
    propertyPath,
    type,
    address
  }
}

/**
 * Schema definition for the MixerComponent
 */
const schema = S.Object({
  coord: S.Number(), // Current coordinate position
  properties: S.Array(
    S.Object({
      entityID: S.EntityID(),
      componentID: S.String(),
      propertyPath: S.String(),
      type: S.Union([
        S.Literal('number'),
        S.Literal('Vector2'),
        S.Literal('Vector3'),
        S.Literal('Vector4'),
        S.Literal('Color'),
        S.Literal('Quaternion')
      ]),
      address: S.String()
    })
  ),
  entries: S.Array(S.Tuple([S.Number(), S.Record(S.String(), S.Array(S.Number()))])), // Array of [coord, entry] tuples
  initialized: S.Bool({ default: false, serialized: false })
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
      const mixerComp = getComponent(entity, MixerComponent)
      if (mixerComp.initialized) return

      setComponent(entity, MixerComponent, {
        initialized: true,
        properties: mixerComp.properties.map((initialProperty) => {
          const { entityID, componentID, propertyPath } = initialProperty
          return createProperty(entity, entityID, componentID, propertyPath) ?? initialProperty
        }),
        entries: mixerComp.entries.toSorted(([coord1], [coord2]) => coord1 - coord2)
      })
    }, [])

    // Trigger mixing when relevant properties change
    useEffect(() => {
      MixerComponent.mix(entity)
    }, [mixerComp.coord, mixerComp.properties, mixerComp.entries])

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
    const updates = new Map<EntityID, Map<string, any>>()

    // Process each property
    for (const property of mixerComp.properties) {
      const { entityID, componentID, propertyPath, type, address } = property

      const mixedValue = mixFuncs[type].fromNumberList(mixed[address])

      // Organize updates by entity and component
      if (!updates.has(entityID)) {
        updates.set(entityID, new Map())
      }
      const entityUpdates = updates.get(entityID)!
      if (!entityUpdates.has(componentID)) {
        entityUpdates.set(componentID, {})
      }

      // Build the updated component data
      const componentUpdate = entityUpdates.get(componentID)
      const updatedComponent = setPropertyValue(componentUpdate, propertyPath, mixedValue)
      updates.get(entityID)!.set(componentID, updatedComponent)
    }

    // Apply all updates
    for (const [entityID, componentUpdates] of updates) {
      const entity = UUIDComponent.getEntityFromSameSourceByID(mixerEntity, entityID)
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

    const entries = mixerComp.entries

    // Handle edge cases
    if (entries.length === 0) return MixerComponent.getDefaultEntry(mixerEntity)
    if (entries.length === 1)
      return Object.fromEntries(Object.entries(entries[0][1]).map(([key, value]) => [key, [...value]]))

    // Find the entries to interpolate between using binary search
    const lastCoord = entries.length - 1
    let left = 0,
      right = lastCoord,
      mid = 0
    while (left <= right) {
      mid = Math.floor((left + right) / 2)
      const midCoord = entries[mid][0]
      if (midCoord < coord) {
        left = mid + 1
      } else if (midCoord > coord) {
        right = mid - 1
      } else {
        break
      }
    }
    if (entries[mid][0] > coord && mid > 0) {
      mid--
    }
    const from = mid
    const to = Math.min(lastCoord, from + 1)

    // Get the entries and calculate interpolation factor
    const [fromCoord, fromEntry] = entries[from]
    const [toCoord, toEntry] = entries[to]
    const p = from === to ? 1 : (coord - fromCoord) / (toCoord - fromCoord)

    // Interpolate each property

    return Object.fromEntries(
      mixerComp.properties.map(({ address, type }) => {
        const [fromValue, toValue] = [fromEntry[address], toEntry[address]]
        const value =
          fromValue == null || toValue == null
            ? mixFuncs[type].create(fromValue ?? toValue)
            : mixFuncs[type].lerp(mixFuncs[type].fromNumberList(fromValue), mixFuncs[type].fromNumberList(toValue), p)
        return [address, mixFuncs[type].toNumberList(value)]
      })
    )
  },

  /**
   * Adds a property to be tracked by the mixer
   * @param mixerEntity The entity with the MixerComponent
   * @param targetEntityID The entity containing the property to track
   * @param targetComponent The component containing the property to track
   * @param propertyPath The path to the property to track
   * @returns A function to set values for this property in entries, or null if the property couldn't be added
   */
  addProperty: (
    mixerEntity: Entity,
    targetEntityID: EntityID,
    targetComponent: AnyComponentWithID | string,
    propertyPath: string
  ) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)

    const packedAddress = packAddress(targetEntityID, targetComponent, propertyPath)
    const existingProperty = mixerComp.properties.find((p) => p.address === packedAddress)
    if (existingProperty != null)
      return MixerComponent.propertySetter(mixerEntity, targetEntityID, targetComponent, propertyPath)

    // Create the property
    const property = createProperty(mixerEntity, targetEntityID, targetComponent, propertyPath)
    if (property == null) return null

    // Add to tracked properties
    const newProperties = [...mixerComp.properties, property]

    // Initialize property in all existing entries
    const newEntries: [number, Entry][] = mixerComp.entries.map(([coord, entry]) => {
      const value = mixFuncs[property.type].toNumberList(mixFuncs[property.type].create())
      return [coord, { ...entry, [packedAddress]: value }]
    })

    setComponent(mixerEntity, MixerComponent, {
      properties: newProperties,
      entries: newEntries
    })

    return MixerComponent.propertySetter(mixerEntity, targetEntityID, targetComponent, propertyPath)
  },

  /**
   * Creates a function that generates entry data for a specific property
   * @param mixerEntity The entity with the MixerComponent
   * @param targetEntityID The entity containing the property
   * @param targetComponent The component containing the property
   * @param propertyPath The path to the property
   * @returns A function that takes a value and returns entry data for the property, or null if the property isn't tracked
   */
  propertySetter: (
    mixerEntity: Entity,
    targetEntityID: EntityID,
    targetComponent: AnyComponentWithID | string,
    propertyPath: string
  ): ((value: Mixable) => Entry) | null => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const packedAddress = packAddress(targetEntityID, targetComponent, propertyPath)
    const property = mixerComp.properties.find((p) => p.address === packedAddress)
    if (property == null) return null
    return (value: Mixable) => ({ [packedAddress]: mixFuncs[property.type].toNumberList(value) })
  },

  /**
   * Removes a property from being tracked by the mixer
   * @param mixerEntity The entity with the MixerComponent
   * @param targetEntityID The entity containing the property
   * @param targetComponent The component containing the property
   * @param propertyPath The path to the property
   */
  removeProperty: (
    mixerEntity: Entity,
    targetEntityID: EntityID,
    targetComponent: AnyComponentWithID | string,
    propertyPath: string
  ) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const packedAddress = packAddress(targetEntityID, targetComponent, propertyPath)
    const index = mixerComp.properties.findIndex((p) => p.address === packedAddress)
    if (index === -1) return
    const newProperties = mixerComp.properties.toSpliced(index, 1)

    setComponent(mixerEntity, MixerComponent, {
      properties: newProperties
    })
  },

  /**
   * Removes a property at a specific index from the mixer (useful for UI)
   * @param mixerEntity The entity with the MixerComponent
   * @param index The index of the property to remove
   */
  removePropertyAtIndex: (mixerEntity: Entity, index: number) => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    if (index < 0 || index >= mixerComp.properties.length) return
    const packedAddress = mixerComp.properties[index]
    // Remove from tracked properties
    const newProperties = mixerComp.properties.filter((p) => p !== packedAddress)

    setComponent(mixerEntity, MixerComponent, {
      properties: newProperties
    })
  },

  /**
   * Gets an entry at a specific coordinate
   * @param mixerEntity The entity with the MixerComponent
   * @param coord The coordinate to get the entry for
   * @returns The entry at the coordinate, or null if none exists
   */
  getEntry: (mixerEntity: Entity, coord: number): Entry | null => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    const [, entry] = mixerComp.entries.find(([entryCoord]) => entryCoord === coord) ?? [null, null]
    return entry
  },

  /**
   * Creates a default entry with default values for all tracked properties
   * @param mixerEntity The entity with the MixerComponent
   * @returns A new entry with default values
   */
  getDefaultEntry: (mixerEntity: Entity): Entry => {
    const mixerComp = getComponent(mixerEntity, MixerComponent)
    return Object.fromEntries(
      mixerComp.properties.map(({ address, type }) => [address, mixFuncs[type].toNumberList(mixFuncs[type].create())])
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
    const newEntries = [...mixerComp.entries]
    appendEntries: {
      for (const [index, [entryCoord]] of newEntries.entries()) {
        if (entryCoord === coord) {
          newEntries[index] = [coord, entry]
          break appendEntries
        }
        if (entryCoord > coord) {
          newEntries.splice(index, 0, [coord, entry])
          break appendEntries
        }
      }
      newEntries.push([coord, entry])
    }
    setComponent(mixerEntity, MixerComponent, {
      entries: newEntries
    })
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
    const index = mixerComp.entries.findIndex(([entryCoord]) => entryCoord === coord)
    if (index === -1) return
    const newEntries = mixerComp.entries.toSpliced(index, 1)
    setComponent(mixerEntity, MixerComponent, {
      entries: newEntries
    })
  }
})
