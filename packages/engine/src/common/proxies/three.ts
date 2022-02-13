import { Vector3, Quaternion } from 'three'
import { Entity } from '../../ecs/classes/Entity'

const { defineProperties } = Object

export const proxifyVector3 = (store, entity: Entity, vector3): Vector3 =>
  defineProperties(vector3, {
    _eid: { value: entity },
    _store: { value: store },
    x: {
      get() {
        return this._store.x[this._eid]
      },
      set(n) {
        return (this._store.x[this._eid] = n)
      }
    },
    y: {
      get() {
        return this._store.y[this._eid]
      },
      set(n) {
        return (this._store.y[this._eid] = n)
      }
    },
    z: {
      get() {
        return this._store.z[this._eid]
      },
      set(n) {
        return (this._store.z[this._eid] = n)
      }
    }
  })

export const createVector3Proxy = (store, entity: Entity) => proxifyVector3(store, entity, new Vector3())

export const proxifyQuaternion = (store, entity: Entity, quaternion: Quaternion): Quaternion =>
  defineProperties(quaternion, {
    _eid: { value: entity },
    _store: { value: store },
    _x: {
      get() {
        return this._store.x[this._eid]
      },
      set(n) {
        return (this._store.x[this._eid] = n)
      }
    },
    _y: {
      get() {
        return this._store.y[this._eid]
      },
      set(n) {
        return (this._store.y[this._eid] = n)
      }
    },
    _z: {
      get() {
        return this._store.z[this._eid]
      },
      set(n) {
        return (this._store.z[this._eid] = n)
      }
    },
    _w: {
      get() {
        return this._store.w[this._eid]
      },
      set(n) {
        return (this._store.w[this._eid] = n)
      }
    }
  })

export const createQuaternionProxy = (store, entity: Entity): Quaternion =>
  proxifyQuaternion(store, entity, new Quaternion())
