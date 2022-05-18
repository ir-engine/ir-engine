import { Vector3, Quaternion } from 'three'

const { defineProperties } = Object

export const createVector3Proxy = (store, entity) =>
  defineProperties(new Vector3(), {
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

export const createQuaternionProxy = (store, entity) =>
  defineProperties(new Quaternion(), {
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
