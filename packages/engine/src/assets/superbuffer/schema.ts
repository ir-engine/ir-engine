import { BufferViewOrSchema, SchemaDefinition } from './types'
import { isBufferView, isObject } from './utils'

/**
 * The Schema class provides an API for creating definitions.
 */
export class Schema<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Map that contains references to all Schema instances.
   */
  public static readonly instances = new Map<number, Schema>()
  /**
   * Id of the schema.
   */
  public readonly id: number
  /**
   * Schema definition reference.
   */
  public readonly struct: SchemaDefinition<Readonly<T>>

  /**
   * Create a new Schema instance.
   * @param name Unique name of the Schema.
   * @param struct SchemaDefinition structure of the Schema.
   */
  public constructor(struct: SchemaDefinition<T>, id: number = Schema.instances.size) {
    this.struct = Schema.definition(struct)
    this.id = id

    // Ensure schema with same name does not exist
    if (Schema.instances.get(id)) {
      throw new Error(`A Schema with the name "${id}" already exists.`)
    } else {
      Schema.instances.set(id, this)
      if (Schema.instances.size > 255) {
        throw new Error('The maximum number of Schema instances (255) has been reached.')
      }
    }
  }

  /**
   * Create a SchemaDefinition without creating a Schema instance.
   * @param obj Object defining the schema.
   */
  public static definition<T>(obj: SchemaDefinition<T>): SchemaDefinition<Readonly<T>> {
    return this.sortStruct(obj)
  }

  /**
   * Sort and validate the structure of the SchemaDefinition.
   * @param struct The SchemaDefinition structure to be sorted.
   */
  protected static sortStruct<T extends Record<string, any>>(struct: T): T {
    const keys = Object.keys(struct)
    if (keys.length <= 1) {
      // sort() does not run if there is only 1 array element, ensure that element is validated
      this.getSortPriority(struct[keys[0]])
    }
    // Find the type of each property of the struct
    const sortedKeys = keys.sort((a, b) => {
      const indexA = this.getSortPriority(struct[a])
      const indexB = this.getSortPriority(struct[b])

      // Same type, sort alphabetically by key
      if (indexA === indexB) {
        return a < b ? -1 : 1
      }
      // Different type, sort by returned index
      else {
        return indexA < indexB ? -1 : 1
      }
    })

    const sortedStruct: Record<string, any> = {}
    for (const key of sortedKeys) {
      const value = struct[key]
      // Object
      if (isObject(value) && !isBufferView(value)) {
        sortedStruct[key] = this.sortStruct(value)
      }
      // Schema, BufferView, Array
      else {
        sortedStruct[key] = value
      }
    }
    return sortedStruct as T
  }

  /**
   * Returns the priority index of the entity based on its type, in order:
   * `BufferView<number>`, `BufferView<number>[]`, `BufferView<string>`, `BufferView<string>[]`,
   * `Object`, `Schema`, `Schema[]`
   * @param item Entity to determine sort priority.
   */
  protected static getSortPriority(item: BufferViewOrSchema): number {
    if (isBufferView(item)) {
      if (item.type === 'String') {
        return 2
      }
      return 0
    }
    if (item instanceof Schema) {
      return 5
    }
    if (Array.isArray(item)) {
      if (isBufferView(item[0])) {
        if (item[0].type === 'String') {
          return 3
        }
        return 1
      }
      if (item[0] instanceof Schema) {
        return 6
      }
    }
    if (isObject(item)) {
      return 4
    }
    throw new Error(`Unsupported data type in schema definition: ${item}`)
  }
}
