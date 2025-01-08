import {
  ComponentRef,
  EntityId,
  QueryTerm,
  addComponent as ecsAddComponent,
  hasComponent as ecsHasComponent,
  removeComponent as ecsRemoveComponent,
  observe,
  onAdd,
  onRemove,
  query
} from 'bitecs'

export interface IWorld {}

export type ComponentProp = TypedArray | Array<TypedArray>

export interface IComponentProp {}

export interface IComponent {}

export type Component = IComponent | ComponentType<ISchema>

export type Query<W extends IWorld = IWorld> = (world: W) => readonly EntityId[]

export function defineQuery(components: QueryTerm[]) {
  const queryFn = (world: IWorld) => query(world, components)
  queryFn.components = components
  return queryFn
}

export function enterQuery<W extends IWorld = IWorld>(queryFn: Query<W>): Query<W> {
  let queue: number[] = []
  const initSet = new WeakSet<IWorld>()
  const query = (world: W) => {
    if (!initSet.has(world)) {
      queue.push(...queryFn(world))
      observe(world, onAdd(...(queryFn as any).components), (eid: EntityId) => queue.push(eid))
      initSet.add(world)
    }
    const results = queue.slice()
    queue.length = 0
    return results
  }
  return query
}

export function exitQuery<W extends IWorld = IWorld>(queryFn: Query<W>): Query<W> {
  let queue: number[] = []
  const initSet = new WeakSet<IWorld>()
  return (world: W) => {
    if (!initSet.has(world)) {
      observe(world, onRemove(...(queryFn as any).components), (eid: EntityId) => queue.push(eid))
      initSet.add(world)
    }
    const results = queue.slice()
    queue.length = 0
    return results
  }
}

export const addComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsAddComponent(world, eid, component)

export const hasComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsHasComponent(world, eid, component)

export const removeComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsRemoveComponent(world, eid, component)

export interface ISchema {
  [key: string]: Type | ListType | ISchema
}

export type Type = 'i8' | 'ui8' | 'ui8c' | 'i16' | 'ui16' | 'i32' | 'ui32' | 'f32' | 'f64' | 'eid'

export type ListType = readonly [Type, number]

export const Types = {
  i8: 'i8' as const,
  ui8: 'ui8' as const,
  ui8c: 'ui8c' as const,
  i16: 'i16' as const,
  ui16: 'ui16' as const,
  i32: 'i32' as const,
  ui32: 'ui32' as const,
  f32: 'f32' as const,
  f64: 'f64' as const,
  eid: 'eid' as const
}

export type TypedArray =
  | Uint8Array
  | Int8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

export type ArrayByType = {
  i8: Int8Array
  ui8: Uint8Array
  ui8c: Uint8ClampedArray
  i16: Int16Array
  ui16: Uint16Array
  i32: Int32Array
  ui32: Uint32Array
  f32: Float32Array
  f64: Float64Array
  eid: Uint32Array
}

// ... existing code ...

const arrayByTypeMap: { [key in Type]: any } = {
  i8: Int8Array,
  ui8: Uint8Array,
  ui8c: Uint8ClampedArray,
  i16: Int16Array,
  ui16: Uint16Array,
  i32: Int32Array,
  ui32: Uint32Array,
  f32: Float32Array,
  f64: Float64Array,
  eid: Uint32Array
}

export type ComponentType<T extends ISchema> = {
  [key in keyof T]: T[key] extends Type
    ? ArrayByType[T[key]]
    : T[key] extends [infer RT, number]
    ? RT extends Type
      ? Array<ArrayByType[RT]>
      : unknown
    : T[key] extends ISchema
    ? ComponentType<T[key]>
    : unknown
}

function createResizableTypeArray(type: Type) {
  const TypeConstructor = arrayByTypeMap[type]
  if (TypeConstructor) {
    const buffer = new (ArrayBuffer as any)(0, { maxByteLength: Math.pow(2, 20) })
    return new TypeConstructor(buffer)
  } else {
    throw new Error(`Unsupported SoA type: ${type}`)
  }
}

export const defineComponent = <T extends ISchema>(schema: T): ComponentType<T> => {
  const createSoA = <U extends ISchema>(schema: U): ComponentType<U> => {
    const component = {} as ComponentType<U>
    for (const key in schema) {
      if (typeof schema[key] === 'string') {
        const type = schema[key] as Type
        component[key] = createResizableTypeArray(type)
      } else if (typeof schema[key] === 'object') {
        component[key] = createSoA(schema[key] as ISchema) as any
      } else {
        throw new Error(`Unsupported SoA type: ${schema[key]}`)
      }
    }
    return component
  }
  return createSoA(schema)
}
