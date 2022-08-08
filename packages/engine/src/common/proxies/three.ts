import { Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'

const { defineProperties } = Object

type Vector3Store = { x: Float32Array; y: Float32Array; z: Float32Array }
type QuaternionStore = { x: Float32Array; y: Float32Array; z: Float32Array; w: Float32Array }

export const proxifyVector3 = (store: Vector3Store, entity: Entity, dirty: Set<Entity>, vector3: Vector3): Vector3 => {
  // Set the initial values
  store.x[entity] = vector3.x
  store.y[entity] = vector3.y
  store.z[entity] = vector3.z
  return defineProperties(vector3, {
    _eid: { value: entity },
    _store: { value: store },
    x: {
      get() {
        return this._store.x[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.x[this._eid] = n)
      }
    },
    y: {
      get() {
        return this._store.y[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.y[this._eid] = n)
      }
    },
    z: {
      get() {
        return this._store.z[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.z[this._eid] = n)
      }
    }
  })
}

export const createVector3Proxy = (store: Vector3Store, entity: Entity, dirty: Set<Entity> = new Set()) =>
  proxifyVector3(store, entity, dirty, new Vector3())

export const proxifyQuaternion = (
  store: QuaternionStore,
  entity: Entity,
  dirty: Set<Entity>,
  quaternion: Quaternion
): Quaternion => {
  // Set the initial values
  store.x[entity] = quaternion.x
  store.y[entity] = quaternion.y
  store.z[entity] = quaternion.z
  store.w[entity] = quaternion.w
  return defineProperties(quaternion, {
    _eid: { value: entity },
    _store: { value: store },
    _x: {
      get() {
        return this._store.x[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.x[this._eid] = n)
      }
    },
    _y: {
      get() {
        return this._store.y[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.y[this._eid] = n)
      }
    },
    _z: {
      get() {
        return this._store.z[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.z[this._eid] = n)
      }
    },
    _w: {
      get() {
        return this._store.w[this._eid]
      },
      set(n) {
        dirty.add(this._eid)
        return (this._store.w[this._eid] = n)
      }
    }
  })
}

export const createQuaternionProxy = (
  store: QuaternionStore,
  entity: Entity,
  dirty: Set<Entity> = new Set()
): Quaternion => proxifyQuaternion(store, entity, dirty, new Quaternion())
