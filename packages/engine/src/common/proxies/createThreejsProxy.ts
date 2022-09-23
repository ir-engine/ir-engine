import { Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'

const { defineProperties } = Object

type Vector3Store = { x: Float32Array; y: Float32Array; z: Float32Array }
type QuaternionStore = { x: Float32Array; y: Float32Array; z: Float32Array; w: Float32Array }

export const proxifyVector3 = (store: Vector3Store, entity: Entity, vector3 = new Vector3()): Vector3 => {
  // Set the initial values
  store.x[entity] = vector3.x
  store.y[entity] = vector3.y
  store.z[entity] = vector3.z
  return defineProperties(vector3, {
    _eid: { value: entity, configurable: true },
    _store: { value: store, configurable: true },
    x: {
      get() {
        return this._store.x[this._eid]
      },
      set(n) {
        return (this._store.x[this._eid] = n)
      },
      configurable: true
    },
    y: {
      get() {
        return this._store.y[this._eid]
      },
      set(n) {
        return (this._store.y[this._eid] = n)
      },
      configurable: true
    },
    z: {
      get() {
        return this._store.z[this._eid]
      },
      set(n) {
        return (this._store.z[this._eid] = n)
      },
      configurable: true
    }
  })
}

export const proxifyVector3WithDirty = (
  store: Vector3Store,
  entity: Entity,
  dirty: Set<Entity>,
  vector3 = new Vector3()
): Vector3 => {
  // Set the initial values
  store.x[entity] = vector3.x
  store.y[entity] = vector3.y
  store.z[entity] = vector3.z
  dirty.add(entity)
  return defineProperties(vector3, {
    _eid: { value: entity, configurable: true },
    _store: { value: store, configurable: true },
    x: {
      get() {
        return this._store.x[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.x[this._eid] = n)
      },
      configurable: true
    },
    y: {
      get() {
        return this._store.y[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.y[this._eid] = n)
      },
      configurable: true
    },
    z: {
      get() {
        return this._store.z[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.z[this._eid] = n)
      },
      configurable: true
    }
  })
}

export const proxifyQuaternion = (
  store: QuaternionStore,
  entity: Entity,
  quaternion = new Quaternion()
): Quaternion => {
  // Set the initial values
  store.x[entity] = quaternion.x
  store.y[entity] = quaternion.y
  store.z[entity] = quaternion.z
  store.w[entity] = quaternion.w
  return defineProperties(quaternion, {
    _eid: { value: entity, configurable: true },
    _store: { value: store, configurable: true },
    _x: {
      get() {
        return this._store.x[this._eid]
      },
      set(n) {
        return (this._store.x[this._eid] = n)
      },
      configurable: true
    },
    _y: {
      get() {
        return this._store.y[this._eid]
      },
      set(n) {
        return (this._store.y[this._eid] = n)
      },
      configurable: true
    },
    _z: {
      get() {
        return this._store.z[this._eid]
      },
      set(n) {
        return (this._store.z[this._eid] = n)
      },
      configurable: true
    },
    _w: {
      get() {
        return this._store.w[this._eid]
      },
      set(n) {
        return (this._store.w[this._eid] = n)
      },
      configurable: true
    }
  })
}

export const proxifyQuaternionWithDirty = (
  store: QuaternionStore,
  entity: Entity,
  dirty: Set<Entity>,
  quaternion = new Quaternion()
): Quaternion => {
  // Set the initial values
  store.x[entity] = quaternion.x
  store.y[entity] = quaternion.y
  store.z[entity] = quaternion.z
  store.w[entity] = quaternion.w
  dirty.add(entity)
  return defineProperties(quaternion, {
    _eid: { value: entity, configurable: true },
    _store: { value: store, configurable: true },
    _x: {
      get() {
        return this._store.x[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.x[this._eid] = n)
      },
      configurable: true
    },
    _y: {
      get() {
        return this._store.y[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.y[this._eid] = n)
      },
      configurable: true
    },
    _z: {
      get() {
        return this._store.z[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.z[this._eid] = n)
      },
      configurable: true
    },
    _w: {
      get() {
        return this._store.w[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.w[this._eid] = n)
      },
      configurable: true
    }
  })
}
