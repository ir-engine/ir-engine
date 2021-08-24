// src/Constants.js// declare module 'bitecs' {
export type Type = 'i8' | 'ui8' | 'ui8c' | 'i16' | 'ui16' | 'i32' | 'ui32' | 'f32' | 'f64'

export type ListType = readonly [Type, number]

export const Types: {
  i8: 'i8'
  ui8: 'ui8'
  ui8c: 'ui8c'
  i16: 'i16'
  ui16: 'ui16'
  i32: 'i32'
  ui32: 'ui32'
  f32: 'f32'
  f64: 'f64'
} = {
  i8: 'i8',
  ui8: 'ui8',
  ui8c: 'ui8c',
  i16: 'i16',
  ui16: 'ui16',
  i32: 'i32',
  ui32: 'ui32',
  f32: 'f32',
  f64: 'f64'
}

export type TypedArray =
  | Uint8Array
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

export type ArrayByType = {
  [Types.i8]: Int8Array
  [Types.ui8]: Uint8Array
  [Types.ui8c]: Uint8ClampedArray
  [Types.i16]: Int16Array
  [Types.ui16]: Uint16Array
  [Types.i32]: Int32Array
  [Types.ui32]: Uint32Array
  [Types.f32]: Float32Array
  [Types.f64]: Float64Array
}

export enum DESERIALIZE_MODE {
  REPLACE,
  APPEND,
  MAP
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

export interface IWorld {
  [key: string]: any
}

export interface ISchema {
  [key: string]: Type | ListType | ISchema
}

export interface IComponentProp {
  [key: string]: TypedArray | Array<TypedArray>
}

export interface IComponent {
  [key: string]: TypedArray | IComponentProp
}

export type Component = IComponent | ComponentType<ISchema>

export type QueryModifier = (c: (IComponent | IComponentProp)[]) => (world: IWorld) => IComponent | QueryModifier

export type Query = (world: IWorld, clearDiff?: Boolean) => number[]

export type System = (world: IWorld, ...args: any[]) => IWorld

export type Serializer = (target: IWorld | number[]) => ArrayBuffer
export type Deserializer = (world: IWorld, packet: ArrayBuffer, mode?: DESERIALIZE_MODE) => void

// export function setDefaultSize(size: number): void
// export function createWorld(): IWorld
// export function resetWorld(world: IWorld): IWorld
// export function deleteWorld(world: IWorld): void
// export function bit_addEntity(world: IWorld): number
// export function bit_removeEntity(world: IWorld, eid: number): void

// export function bit_registerComponent(world: IWorld, component: Component): void
// export function bit_registerComponents(world: IWorld, components: Component[]): void
// export function bit_defineComponent<T extends ISchema>(schema?: T): ComponentType<T>
// export function bit_addComponent(world: IWorld, component: Component, eid: number): void
// export function bit_removeComponent(world: IWorld, component: Component, eid: number): void
// export function bit_hasComponent(world: IWorld, component: Component, eid: number): boolean
// export function bit_getEntityComponents(world: IWorld, eid: number): Component[]

// export function defineQuery(components: (Component | QueryModifier)[]): Query
// export function Changed(c: Component): Component | QueryModifier
// export function Not(c: Component): Component | QueryModifier
// export function enterQuery(query: Query): Query
// export function exitQuery(query: Query): Query
// export function resetChangedQuery(world: IWorld, query: Query): Query
// export function removeQuery(world: IWorld, query: Query): Query
// export function commitRemovals(world: IWorld): void

// export function defineSystem(update: (world: IWorld, ...args: any[]) => IWorld): System

// export function defineSerializer(
//   target: IWorld | Component[] | IComponentProp[] | QueryModifier,
//   maxBytes?: number
// ): Serializer
// export function defineDeserializer(target: IWorld | Component[] | IComponentProp[] | QueryModifier): Deserializer

// export function pipe(...fns: ((...args: any[]) => any)[]): (...input: any[]) => any

// export const parentArray: Symbol
// }

var TYPES_ENUM = {
  i8: 'i8',
  ui8: 'ui8',
  ui8c: 'ui8c',
  i16: 'i16',
  ui16: 'ui16',
  i32: 'i32',
  ui32: 'ui32',
  f32: 'f32',
  f64: 'f64',
  eid: 'eid'
}
var TYPES_NAMES = {
  i8: 'Int8',
  ui8: 'Uint8',
  ui8c: 'Uint8Clamped',
  i16: 'Int16',
  ui16: 'Uint16',
  i32: 'Int32',
  ui32: 'Uint32',
  eid: 'Uint32',
  f32: 'Float32',
  f64: 'Float64'
}
var TYPES = {
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
var UNSIGNED_MAX = {
  uint8: 2 ** 8,
  uint16: 2 ** 16,
  uint32: 2 ** 32
}

// src/Storage.js
var roundToMultiple = (mul) => (x) => Math.ceil(x / mul) * mul
var roundToMultiple4 = roundToMultiple(4)
var $storeRef = Symbol('storeRef')
var $storeSize = Symbol('storeSize')
var $storeMaps = Symbol('storeMaps')
var $storeFlattened = Symbol('storeFlattened')
var $storeBase = Symbol('storeBase')
var $storeType = Symbol('storeType')
var $storeArrayCounts = Symbol('storeArrayCount')
var $storeSubarrays = Symbol('storeSubarrays')
var $subarrayCursors = Symbol('subarrayCursors')
var $subarray = Symbol('subarray')
var $subarrayFrom = Symbol('subarrayFrom')
var $subarrayTo = Symbol('subarrayTo')
var $parentArray = Symbol('subStore')
var $tagStore = Symbol('tagStore')
var $queryShadow = Symbol('queryShadow')
var $serializeShadow = Symbol('serializeShadow')
var $indexType = Symbol('indexType')
var $indexBytes = Symbol('indexBytes')
var $isEidType = Symbol('isEidType')
var stores = {}
var resize = (ta, size) => {
  const newBuffer = new ArrayBuffer(size * ta.BYTES_PER_ELEMENT)
  const newTa = new ta.constructor(newBuffer)
  newTa.set(ta, 0)
  return newTa
}
var createShadow = (store, key) => {
  if (!ArrayBuffer.isView(store)) {
    const shadowStore = store[$parentArray].slice(0).fill(0)
    store[key] = store.map((_, eid) => {
      const from = store[eid][$subarrayFrom]
      const to = store[eid][$subarrayTo]
      return shadowStore.subarray(from, to)
    })
  } else {
    store[key] = (store as any).slice(0).fill(0)
  }
}
var resizeSubarray = (metadata, store, size) => {
  const cursors = metadata[$subarrayCursors]
  let type = store[$storeType]
  const length = store[0].length
  const indexType = length <= UNSIGNED_MAX.uint8 ? 'ui8' : length <= UNSIGNED_MAX.uint16 ? 'ui16' : 'ui32'
  const arrayCount = metadata[$storeArrayCounts][type]
  const summedLength = Array(arrayCount)
    .fill(0)
    .reduce((a, p) => a + length, 0)
  const array = new TYPES[type](roundToMultiple4(summedLength * size))
  array.set(metadata[$storeSubarrays][type])
  metadata[$storeSubarrays][type] = array
  array[$indexType] = TYPES_NAMES[indexType]
  array[$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT
  const start = cursors[type]
  let end = 0
  for (let eid = 0; eid < size; eid++) {
    const from = cursors[type] + eid * length
    const to = from + length
    store[eid] = metadata[$storeSubarrays][type].subarray(from, to)
    store[eid][$subarrayFrom] = from
    store[eid][$subarrayTo] = to
    store[eid][$subarray] = true
    store[eid][$indexType] = TYPES_NAMES[indexType]
    store[eid][$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT
    end = to
  }
  cursors[type] = end
  store[$parentArray] = metadata[$storeSubarrays][type].subarray(start, end)
}
var resizeRecursive = (metadata, store, size) => {
  Object.keys(store).forEach((key) => {
    const ta = store[key]
    if (Array.isArray(ta)) {
      resizeSubarray(metadata, ta, size)
      store[$storeFlattened].push(ta)
    } else if (ArrayBuffer.isView(ta)) {
      store[key] = resize(ta, size)
      store[$storeFlattened].push(store[key])
    } else if (typeof ta === 'object') {
      resizeRecursive(metadata, store[key], size)
    }
  })
}
var resizeStore = (store, size) => {
  if (store[$tagStore]) return
  store[$storeSize] = size
  store[$storeFlattened].length = 0
  Object.keys(store[$subarrayCursors]).forEach((k) => {
    store[$subarrayCursors][k] = 0
  })
  resizeRecursive(store, store, size)
}
var resetStoreFor = (store, eid) => {
  if (store[$storeFlattened]) {
    store[$storeFlattened].forEach((ta) => {
      if (ArrayBuffer.isView(ta)) ta[eid] = 0
      else ta[eid].fill(0)
    })
  }
}
var createTypeStore = (type, length) => {
  const totalBytes = length * TYPES[type].BYTES_PER_ELEMENT
  const buffer = new ArrayBuffer(totalBytes)
  const store = new TYPES[type](buffer)
  store[$isEidType] = type === TYPES_ENUM.eid
  return store
}
var parentArray = (store) => store[$parentArray]
var createArrayStore = (metadata, type, length) => {
  const size = metadata[$storeSize]
  const store = Array(size).fill(0)
  store[$storeType] = type
  store[$isEidType] = type === TYPES_ENUM.eid
  const cursors = metadata[$subarrayCursors]
  const indexType = length < UNSIGNED_MAX.uint8 ? 'ui8' : length < UNSIGNED_MAX.uint16 ? 'ui16' : 'ui32'
  if (!length) throw new Error('bitECS - Must define component array length')
  if (!TYPES[type]) throw new Error(`bitECS - Invalid component array property type ${type}`)
  if (!metadata[$storeSubarrays][type]) {
    const arrayCount = metadata[$storeArrayCounts][type]
    const summedLength = Array(arrayCount)
      .fill(0)
      .reduce((a, p) => a + length, 0)
    const array = new TYPES[type](roundToMultiple4(summedLength * size))
    metadata[$storeSubarrays][type] = array
    array[$indexType] = TYPES_NAMES[indexType]
    array[$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT
  }
  const start = cursors[type]
  let end = 0
  for (let eid = 0; eid < size; eid++) {
    const from = cursors[type] + eid * length
    const to = from + length
    store[eid] = metadata[$storeSubarrays][type].subarray(from, to)
    store[eid][$subarrayFrom] = from
    store[eid][$subarrayTo] = to
    store[eid][$subarray] = true
    store[eid][$indexType] = TYPES_NAMES[indexType]
    store[eid][$indexBytes] = TYPES[indexType].BYTES_PER_ELEMENT
    end = to
  }
  cursors[type] = end
  store[$parentArray] = metadata[$storeSubarrays][type].subarray(start, end)
  return store
}
var isArrayType = (x) => Array.isArray(x) && typeof x[0] === 'string' && typeof x[1] === 'number'
var createStore = (schema, size) => {
  const $store = Symbol('store')
  if (!schema || !Object.keys(schema).length) {
    stores[$store] = {
      [$storeSize]: size,
      [$tagStore]: true,
      [$storeBase]: () => stores[$store]
    }
    return stores[$store]
  }
  schema = JSON.parse(JSON.stringify(schema))
  const arrayCounts = {}
  const collectArrayCounts = (s) => {
    const keys = Object.keys(s)
    for (const k of keys) {
      if (isArrayType(s[k])) {
        if (!arrayCounts[s[k][0]]) arrayCounts[s[k][0]] = 0
        arrayCounts[s[k][0]]++
      } else if (s[k] instanceof Object) {
        collectArrayCounts(s[k])
      }
    }
  }
  collectArrayCounts(schema)
  const metadata = {
    [$storeSize]: size,
    [$storeMaps]: {},
    [$storeSubarrays]: {},
    [$storeRef]: $store,
    [$subarrayCursors]: Object.keys(TYPES).reduce((a, type) => ({ ...a, [type]: 0 }), {}),
    [$storeFlattened]: [],
    [$storeArrayCounts]: arrayCounts
  }
  if (schema instanceof Object && Object.keys(schema).length) {
    const recursiveTransform = (a, k) => {
      if (typeof a[k] === 'string') {
        a[k] = createTypeStore(a[k], size)
        a[k][$storeBase] = () => stores[$store]
        //@ts-ignore
        metadata[$storeFlattened].push(a[k])
      } else if (isArrayType(a[k])) {
        const [type, length] = a[k]
        a[k] = createArrayStore(metadata, type, length)
        a[k][$storeBase] = () => stores[$store]
        //@ts-ignore
        metadata[$storeFlattened].push(a[k])
      } else if (a[k] instanceof Object) {
        a[k] = Object.keys(a[k]).reduce(recursiveTransform, a[k])
      }
      return a
    }
    stores[$store] = Object.assign(Object.keys(schema).reduce(recursiveTransform, schema), metadata)
    stores[$store][$storeBase] = () => stores[$store]
    return stores[$store]
  }
}

// src/Util.js
var SparseSet = () => {
  const dense = []
  const sparse = []
  dense.sort = function (comparator) {
    const result = Array.prototype.sort.call(this, comparator)
    for (let i = 0; i < dense.length; i++) {
      sparse[dense[i]] = i
    }
    return result
  }
  const has = (val) => dense[sparse[val]] === val
  const add = (val) => {
    if (has(val)) return
    sparse[val] = dense.push(val) - 1
  }
  const remove = (val) => {
    if (!has(val)) return
    const index = sparse[val]
    const swapped = dense.pop()
    if (swapped !== val) {
      dense[index] = swapped
      sparse[swapped] = index
    }
  }
  return {
    add,
    remove,
    has,
    sparse,
    dense
  }
}

// src/Serialize.js
// var DESERIALIZE_MODE = {
//   REPLACE: 0,
//   APPEND: 1,
//   MAP: 2
// };
var resized = false
var canonicalize = (target) => {
  let componentProps: any = []
  let changedProps = new Map()
  if (Array.isArray(target)) {
    componentProps = target
      .map((p) => {
        if (!p) throw new Error('bitECS - Cannot serialize undefined component')
        if (typeof p === 'function') {
          const [c, mod] = p()
          if (mod === 'changed') {
            c[$storeFlattened].forEach((prop) => {
              const $ = Symbol()
              createShadow(prop, $)
              changedProps.set(prop, $)
            })
            return p()[$storeFlattened]
          }
        }
        if (Object.getOwnPropertySymbols(p).includes($storeFlattened)) {
          return p[$storeFlattened]
        }
        if (Object.getOwnPropertySymbols(p).includes($storeBase)) {
          return p
        }
      })
      .reduce((a, v) => a.concat(v), [])
  }
  return [componentProps, changedProps]
}
var defineSerializer = (target, maxBytes = 2e7) => {
  const isWorld = Object.getOwnPropertySymbols(target).includes($componentMap)
  let [componentProps, changedProps] = canonicalize(target)
  const buffer = new ArrayBuffer(maxBytes)
  const view = new DataView(buffer)
  return (ents) => {
    if (resized) {
      ;[componentProps, changedProps] = canonicalize(target)
      resized = false
    }
    if (isWorld) {
      componentProps = []
      target[$componentMap].forEach((c, component) => {
        if (component[$storeFlattened]) componentProps.push(...component[$storeFlattened])
        else componentProps.push(component)
      })
    }
    let world
    if (Object.getOwnPropertySymbols(ents).includes($componentMap)) {
      world = ents
      ents = ents[$entityArray]
    } else {
      world = eidToWorld.get(ents[0])
    }
    if (!ents.length) return
    let where = 0
    for (let pid = 0; pid < componentProps.length; pid++) {
      const prop = componentProps[pid]
      const $diff = changedProps.get(prop)
      view.setUint8(where, pid)
      where += 1
      const countWhere = where
      where += 4
      let count = 0
      for (let i = 0; i < ents.length; i++) {
        const eid = ents[i]
        if (!hasComponent(world, prop[$storeBase](), eid)) {
          continue
        }
        if ($diff) {
          if (ArrayBuffer.isView(prop[eid])) {
            let dirty = false
            for (let i2 = 0; i2 < prop[eid].length; i2++) {
              if (prop[eid][i2] !== prop[eid][$diff][i2]) {
                dirty = true
                break
              }
            }
            if (dirty) continue
          } else if (prop[eid] === prop[$diff][eid]) continue
        }
        count++
        view.setUint32(where, eid)
        where += 4
        if (prop[$tagStore]) {
          continue
        }
        if (ArrayBuffer.isView(prop[eid])) {
          const type = prop[eid].constructor.name.replace('Array', '')
          const indexType = prop[eid][$indexType]
          const indexBytes = prop[eid][$indexBytes]
          const countWhere2 = where
          where += 1
          let count2 = 0
          for (let i2 = 0; i2 < prop[eid].length; i2++) {
            const value = prop[eid][i2]
            if ($diff && prop[eid][i2] === prop[eid][$diff][i2]) {
              continue
            }
            view[`set${indexType}`](where, i2)
            where += indexBytes
            view[`set${type}`](where, value)
            where += prop[eid].BYTES_PER_ELEMENT
            count2++
          }
          view[`set${indexType}`](countWhere2, count2)
        } else {
          const type = prop.constructor.name.replace('Array', '')
          view[`set${type}`](where, prop[eid])
          where += prop.BYTES_PER_ELEMENT
          if (prop[$diff]) prop[$diff][eid] = prop[eid]
        }
      }
      view.setUint32(countWhere, count)
    }
    return buffer.slice(0, where)
  }
}
var newEntities = new Map()
var defineDeserializer = (target) => {
  const isWorld = Object.getOwnPropertySymbols(target).includes($componentMap)
  let [componentProps] = canonicalize(target)
  return (world, packet, mode = 0) => {
    newEntities.clear()
    if (resized) {
      ;[componentProps] = canonicalize(target)
      resized = false
    }
    if (isWorld) {
      componentProps = []
      target[$componentMap].forEach((c, component) => {
        if (component[$storeFlattened]) componentProps.push(...component[$storeFlattened])
        else componentProps.push(component)
      })
    }
    const localEntities = world[$localEntities]
    const view = new DataView(packet)
    let where = 0
    while (where < packet.byteLength) {
      const pid = view.getUint8(where)
      where += 1
      const entityCount = view.getUint32(where)
      where += 4
      const prop = componentProps[pid]
      for (let i = 0; i < entityCount; i++) {
        let eid = view.getUint32(where)
        where += 4
        if (mode === DESERIALIZE_MODE.MAP) {
          if (localEntities.has(eid)) {
            eid = localEntities.get(eid)
          } else if (newEntities.has(eid)) {
            eid = newEntities.get(eid)
          } else {
            const newEid = addEntity(world)
            localEntities.set(eid, newEid)
            newEntities.set(eid, newEid)
            eid = newEid
          }
        }
        if (
          mode === DESERIALIZE_MODE.APPEND ||
          (mode === DESERIALIZE_MODE.REPLACE && !world[$entitySparseSet].has(eid))
        ) {
          const newEid = newEntities.get(eid) || addEntity(world)
          newEntities.set(eid, newEid)
          eid = newEid
        }
        const component = prop[$storeBase]()
        if (!hasComponent(world, component, eid)) {
          addComponent(world, component, eid)
        }
        if (component[$tagStore]) {
          continue
        }
        if (ArrayBuffer.isView(prop[eid])) {
          const array = prop[eid]
          const count = view[`get${array[$indexType]}`](where)
          where += array[$indexBytes]
          for (let i2 = 0; i2 < count; i2++) {
            const index = view[`get${array[$indexType]}`](where)
            where += array[$indexBytes]
            const value = view[`get${array.constructor.name.replace('Array', '')}`](where)
            where += array.BYTES_PER_ELEMENT
            if (prop[$isEidType]) {
              let localEid = localEntities.get(value)
              if (!world[$entitySparseSet].has(localEid)) localEid = addEntity(world)
              prop[eid][index] = localEid
            } else prop[eid][index] = value
          }
        } else {
          const value = view[`get${prop.constructor.name.replace('Array', '')}`](where)
          where += prop.BYTES_PER_ELEMENT
          if (prop[$isEidType]) {
            let localEid = localEntities.get(value)
            if (!world[$entitySparseSet].has(localEid)) localEid = addEntity(world)
            prop[eid] = localEid
          } else prop[eid] = value
        }
      }
    }
  }
}

// src/Entity.js
var $entityMasks = Symbol('entityMasks')
var $entityComponents = Symbol('entityMasks')
var $entitySparseSet = Symbol('entitySparseSet')
var $entityArray = Symbol('entityArray')
var $entityIndices = Symbol('entityIndices')
var $removedEntities = Symbol('removedEntities')
var defaultSize = 1e5
var globalEntityCursor = 0
var globalSize = defaultSize
var getGlobalSize = () => globalSize
var removed = []
var resetGlobals = () => {
  globalSize = defaultSize
  globalEntityCursor = 0
  removed.length = 0
}
var getDefaultSize = () => defaultSize
var setDefaultSize = (size) => {
  defaultSize = size
  resetGlobals()
}
var getEntityCursor = () => globalEntityCursor
var eidToWorld = new Map()
var addEntity = (world) => {
  const eid = removed.length > 0 ? removed.shift() : globalEntityCursor++
  world[$entitySparseSet].add(eid)
  eidToWorld.set(eid, world)
  if (globalEntityCursor >= defaultSize) {
    console.error(`bitECS - max entities of ${defaultSize} reached, increase with setDefaultSize function.`)
  }
  world[$notQueries].forEach((q) => {
    const match = queryCheckEntity(world, q, eid)
    if (match) queryAddEntity(q, eid)
  })
  world[$entityComponents].set(eid, new Set())
  return eid
}
var removeEntity = (world, eid) => {
  if (!world[$entitySparseSet].has(eid)) return
  world[$queries].forEach((q) => {
    queryRemoveEntity(world, q, eid)
  })
  removed.push(eid)
  world[$entitySparseSet].remove(eid)
  world[$entityComponents].delete(eid)
  for (let i = 0; i < world[$entityMasks].length; i++) world[$entityMasks][i][eid] = 0
}
var getEntityComponents = (world, eid) => Array.from(world[$entityComponents].get(eid))

// src/Query.js
function Not(c) {
  return () => [c, 'not']
}
function Changed(c) {
  return () => [c, 'changed']
}
function Any(...comps) {
  return function QueryAny() {
    return comps
  }
}
function All(...comps) {
  return function QueryAll() {
    return comps
  }
}
function None(...comps) {
  return function QueryNone() {
    return comps
  }
}
var $queries = Symbol('queries')
var $notQueries = Symbol('notQueries')
var $queryAny = Symbol('queryAny')
var $queryAll = Symbol('queryAll')
var $queryNone = Symbol('queryNone')
var $queryMap = Symbol('queryMap')
var $dirtyQueries = Symbol('$dirtyQueries')
var $queryComponents = Symbol('queryComponents')
var $enterQuery = Symbol('enterQuery')
var $exitQuery = Symbol('exitQuery')
var enterQuery = (query) => (world) => {
  if (!world[$queryMap].has(query)) registerQuery(world, query)
  const q = world[$queryMap].get(query)
  return q.entered.splice(0)
}
var exitQuery = (query) => (world) => {
  if (!world[$queryMap].has(query)) registerQuery(world, query)
  const q = world[$queryMap].get(query)
  return q.exited.splice(0)
}
var registerQuery = (world, query) => {
  const components2 = []
  const notComponents = []
  const changedComponents = []
  query[$queryComponents].forEach((c) => {
    if (typeof c === 'function') {
      const [comp, mod] = c()
      if (!world[$componentMap].has(comp)) registerComponent(world, comp)
      if (mod === 'not') {
        notComponents.push(comp)
      }
      if (mod === 'changed') {
        changedComponents.push(comp)
        components2.push(comp)
      }
    } else {
      if (!world[$componentMap].has(c)) registerComponent(world, c)
      components2.push(c)
    }
  })
  const mapComponents = (c) => world[$componentMap].get(c)
  const allComponents = components2.concat(notComponents).map(mapComponents)
  const sparseSet = SparseSet()
  const archetypes = []
  const changed = []
  const toRemove = []
  const entered = []
  const exited = []
  const generations = allComponents
    .map((c) => c.generationId)
    .reduce((a, v) => {
      if (a.includes(v)) return a
      a.push(v)
      return a
    }, [])
  const reduceBitflags = (a, c) => {
    if (!a[c.generationId]) a[c.generationId] = 0
    a[c.generationId] |= c.bitflag
    return a
  }
  const masks = components2.map(mapComponents).reduce(reduceBitflags, {})
  const notMasks = notComponents.map(mapComponents).reduce(reduceBitflags, {})
  const hasMasks = allComponents.reduce(reduceBitflags, {})
  const flatProps = components2
    .filter((c) => !c[$tagStore])
    .map((c) => (Object.getOwnPropertySymbols(c).includes($storeFlattened) ? c[$storeFlattened] : [c]))
    .reduce((a, v) => a.concat(v), [])
  const shadows = flatProps.map((prop) => {
    const $ = Symbol()
    createShadow(prop, $)
    return prop[$]
  }, [])
  const q = Object.assign(sparseSet, {
    archetypes,
    changed,
    components: components2,
    notComponents,
    changedComponents,
    masks,
    notMasks,
    hasMasks,
    generations,
    flatProps,
    toRemove,
    entered,
    exited,
    shadows
  })
  world[$queryMap].set(query, q)
  world[$queries].add(q)
  allComponents.forEach((c) => {
    c.queries.add(q)
  })
  if (notComponents.length) world[$notQueries].add(q)
  for (let eid = 0; eid < getEntityCursor(); eid++) {
    if (!world[$entitySparseSet].has(eid)) continue
    if (queryCheckEntity(world, q, eid)) {
      queryAddEntity(q, eid)
    }
  }
}
var diff = (q, clearDiff) => {
  if (clearDiff) q.changed = []
  const { flatProps, shadows } = q
  for (let i = 0; i < q.dense.length; i++) {
    const eid = q.dense[i]
    let dirty = false
    for (let pid = 0; pid < flatProps.length; pid++) {
      const prop = flatProps[pid]
      const shadow = shadows[pid]
      if (ArrayBuffer.isView(prop[eid])) {
        for (let i2 = 0; i2 < prop[eid].length; i2++) {
          if (prop[eid][i2] !== shadow[eid][i2]) {
            dirty = true
            shadow[eid][i2] = prop[eid][i2]
            break
          }
        }
      } else {
        if (prop[eid] !== shadow[eid]) {
          dirty = true
          shadow[eid] = prop[eid]
        }
      }
    }
    if (dirty) q.changed.push(eid)
  }
  return q.changed
}
var flatten = (a, v) => a.concat(v)
var aggregateComponentsFor = (mod) => (x) => x.filter((f) => f.name === mod().constructor.name).reduce(flatten)
var getAnyComponents = aggregateComponentsFor(Any)
var getAllComponents = aggregateComponentsFor(All)
var getNoneComponents = aggregateComponentsFor(None)
var defineQuery = (...args) => {
  let components2
  let any, all, none
  if (Array.isArray(args[0])) {
    components2 = args[0]
  } else {
    any = getAnyComponents(args)
    all = getAllComponents(args)
    none = getNoneComponents(args)
  }
  if (components2 === void 0 || components2[$componentMap] !== void 0) {
    return (world) => (world ? world[$entityArray] : components2[$entityArray])
  }
  const query = function (world, clearDiff = true) {
    if (!world[$queryMap].has(query)) registerQuery(world, query)
    const q = world[$queryMap].get(query)
    commitRemovals(world)
    if (q.changedComponents.length) return diff(q, clearDiff)
    return q.dense
  }
  query[$queryComponents] = components2
  query[$queryAny] = any
  query[$queryAll] = all
  query[$queryNone] = none
  return query
}
var queryCheckEntity = (world, q, eid) => {
  const { masks, notMasks, generations } = q
  let or = 0
  for (let i = 0; i < generations.length; i++) {
    const generationId = generations[i]
    const qMask = masks[generationId]
    const qNotMask = notMasks[generationId]
    const eMask = world[$entityMasks][generationId][eid]
    if (qNotMask && (eMask & qNotMask) === qNotMask) {
      return false
    }
    if (qMask && (eMask & qMask) !== qMask) {
      return false
    }
  }
  return true
}
var queryAddEntity = (q, eid) => {
  if (q.has(eid)) return
  q.add(eid)
  q.entered.push(eid)
}
var queryCommitRemovals = (q) => {
  while (q.toRemove.length) {
    q.remove(q.toRemove.pop())
  }
}
var commitRemovals = (world) => {
  world[$dirtyQueries].forEach(queryCommitRemovals)
  world[$dirtyQueries].clear()
}
var queryRemoveEntity = (world, q, eid) => {
  if (!q.has(eid)) return
  q.toRemove.push(eid)
  world[$dirtyQueries].add(q)
  q.exited.push(eid)
}
var resetChangedQuery = (world, query) => {
  const q = world[$queryMap].get(query)
  q.changed = []
}
var removeQuery = (world, query) => {
  const q = world[$queryMap].get(query)
  world[$queries].delete(q)
  world[$queryMap].delete(query)
}

// src/Component.js
var $componentMap = Symbol('componentMap')
var components = []
var defineComponent = <T extends ISchema>(schema?: T): ComponentType<T> => {
  const component = createStore(schema, getDefaultSize())
  if (schema && Object.keys(schema).length) components.push(component)
  return component
}
var incrementBitflag = (world) => {
  world[$bitflag] *= 2
  if (world[$bitflag] >= 2 ** 31) {
    world[$bitflag] = 1
    world[$entityMasks].push(new Uint32Array(world[$size]))
  }
}
var registerComponent = (world, component) => {
  if (!component) throw new Error(`bitECS - Cannot register null or undefined component`)
  const queries = new Set()
  const notQueries = new Set()
  const changedQueries = new Set()
  world[$queries].forEach((q) => {
    if (q.components.includes(component)) {
      queries.add(q)
    }
  })
  world[$componentMap].set(component, {
    generationId: world[$entityMasks].length - 1,
    bitflag: world[$bitflag],
    store: component,
    queries,
    notQueries,
    changedQueries
  })
  if (component[$storeSize] < world[$size]) {
    resizeStore(component, world[$size])
  }
  incrementBitflag(world)
}
var registerComponents = (world, components2) => {
  components2.forEach((c) => registerComponent(world, c))
}
var hasComponent = (world, component, eid) => {
  const registeredComponent = world[$componentMap].get(component)
  if (!registeredComponent) return
  const { generationId, bitflag } = registeredComponent
  const mask = world[$entityMasks][generationId][eid]
  return (mask & bitflag) === bitflag
}
var addComponent = (world, component, eid, reset = false) => {
  if (!world[$componentMap].has(component)) registerComponent(world, component)
  if (hasComponent(world, component, eid)) return
  const c = world[$componentMap].get(component)
  const { generationId, bitflag, queries, notQueries } = c
  world[$entityMasks][generationId][eid] |= bitflag
  queries.forEach((q) => {
    const match = queryCheckEntity(world, q, eid)
    if (match) queryAddEntity(q, eid)
    else queryRemoveEntity(world, q, eid)
  })
  world[$entityComponents].get(eid).add(component)
  if (reset) resetStoreFor(component, eid)
}
var removeComponent = (world, component, eid, reset = true) => {
  const c = world[$componentMap].get(component)
  const { generationId, bitflag, queries, notQueries } = c
  if (!(world[$entityMasks][generationId][eid] & bitflag)) return
  world[$entityMasks][generationId][eid] &= ~bitflag
  queries.forEach((q) => {
    const match = queryCheckEntity(world, q, eid)
    if (match) queryAddEntity(q, eid)
    else queryRemoveEntity(world, q, eid)
  })
  world[$entityComponents].get(eid).delete(component)
  if (reset) resetStoreFor(component, eid)
}

// src/World.js
var $size = Symbol('size')
var $resizeThreshold = Symbol('resizeThreshold')
var $bitflag = Symbol('bitflag')
var $archetypes = Symbol('archetypes')
var $localEntities = Symbol('localEntities')
var worlds = []
var createWorld = () => {
  const world = {}
  resetWorld(world)
  worlds.push(world)
  return world
}
var resetWorld = (world) => {
  const size = getGlobalSize()
  world[$size] = size
  if (world[$entityArray]) world[$entityArray].forEach((eid) => removeEntity(world, eid))
  world[$entityMasks] = [new Uint32Array(size)]
  world[$entityComponents] = new Map()
  world[$archetypes] = []
  world[$entitySparseSet] = SparseSet()
  world[$entityArray] = world[$entitySparseSet].dense
  world[$bitflag] = 1
  world[$componentMap] = new Map()
  world[$queryMap] = new Map()
  world[$queries] = new Set()
  world[$notQueries] = new Set()
  world[$dirtyQueries] = new Set()
  world[$localEntities] = new Map()
  return world
}
var deleteWorld = (world) => {
  Object.getOwnPropertySymbols(world).forEach(($) => {
    delete world[$]
  })
  Object.keys(world).forEach((key) => {
    delete world[key]
  })
  worlds.splice(worlds.indexOf(world), 1)
}

// src/System.js
var defineSystem = (fn1, fn2 = undefined) => {
  const update = fn2 !== void 0 ? fn2 : fn1
  const create = fn2 !== void 0 ? fn1 : void 0
  const init = new Set()
  const system = (world, ...args) => {
    if (create && !init.has(world)) {
      create(world, ...args)
      init.add(world)
    }
    update(world, ...args)
    commitRemovals(world)
    return world
  }
  Object.defineProperty(system, 'name', {
    value: (update.name || 'AnonymousSystem') + '_internal',
    configurable: true
  })
  return system
}

// src/index.js
var pipe =
  (...fns) =>
  (...args) => {
    const input = Array.isArray(args[0]) ? args[0] : args
    if (!input || input.length === 0) return
    fns = Array.isArray(fns[0]) ? fns[0] : fns
    let tmp = input
    for (let i = 0; i < fns.length; i++) {
      const fn = fns[i]
      if (Array.isArray(tmp)) {
        tmp = fn(...tmp)
      } else {
        tmp = fn(tmp)
      }
    }
    return tmp
  }
// var Types = TYPES_ENUM;
export {
  Changed,
  // DESERIALIZE_MODE,
  Not,
  // Types,
  addComponent,
  addEntity,
  commitRemovals,
  createWorld,
  defineComponent,
  defineDeserializer,
  defineQuery,
  defineSerializer,
  defineSystem,
  deleteWorld,
  enterQuery,
  exitQuery,
  getEntityComponents,
  hasComponent,
  parentArray,
  pipe,
  registerComponent,
  registerComponents,
  removeComponent,
  removeEntity,
  removeQuery,
  resetChangedQuery,
  resetWorld,
  setDefaultSize
}
//# sourceMappingURL=index.mjs.map
