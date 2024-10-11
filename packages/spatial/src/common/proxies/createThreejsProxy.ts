/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
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

import { Matrix4, Quaternion, Vector3 } from 'three'

import { Entity } from '@ir-engine/ecs/src/Entity'

const { defineProperties } = Object

type Vector3Proxy = { x: number; y: number; z: number }
type QuaternionProxy = { x: number; y: number; z: number; w: number }
type Mat4Proxy = Float64Array

type Vector3Store = { x: Float64Array; y: Float64Array; z: Float64Array }
type QuaternionStore = { x: Float64Array; y: Float64Array; z: Float64Array; w: Float64Array }

export interface ProxyExtensions {
  entity: number
  store: Vector3Proxy | QuaternionProxy
}

export const Vec3Proxy = (vec3Proxy: Vector3Proxy, initial = { x: 0, y: 0, z: 0 }) => {
  vec3Proxy.x = initial.x
  vec3Proxy.y = initial.y
  vec3Proxy.z = initial.z
  return defineProperties(new Vector3(), {
    x: {
      get() {
        return vec3Proxy.x
      },
      set(n) {
        return (vec3Proxy.x = n)
      },
      configurable: true
    },
    y: {
      get() {
        return vec3Proxy.y
      },
      set(n) {
        return (vec3Proxy.y = n)
      },
      configurable: true
    },
    z: {
      get() {
        return vec3Proxy.z
      },
      set(n) {
        return (vec3Proxy.z = n)
      },
      configurable: true
    }
  })
}

export const Vec3ProxyDirty = (
  vec3Proxy: Vector3Proxy,
  entity: Entity,
  dirty: Record<Entity, boolean>,
  initial = { x: 0, y: 0, z: 0 }
) => {
  vec3Proxy.x = initial.x
  vec3Proxy.y = initial.y
  vec3Proxy.z = initial.z
  dirty[entity] = true
  return defineProperties(new Vector3(), {
    x: {
      get() {
        return vec3Proxy.x
      },
      set(n) {
        dirty[entity] = true
        return (vec3Proxy.x = n)
      },
      configurable: true
    },
    y: {
      get() {
        return vec3Proxy.y
      },
      set(n) {
        dirty[entity] = true
        return (vec3Proxy.y = n)
      },
      configurable: true
    },
    z: {
      get() {
        return vec3Proxy.z
      },
      set(n) {
        dirty[entity] = true
        return (vec3Proxy.z = n)
      },
      configurable: true
    }
  })
}

export const QuaternionProxy = (quatProxy: QuaternionProxy, initial = { x: 0, y: 0, z: 0, w: 1 }) => {
  quatProxy.x = initial.x
  quatProxy.y = initial.y
  quatProxy.z = initial.z
  quatProxy.w = initial.w
  return defineProperties(new Quaternion(), {
    x: {
      get() {
        return quatProxy.x
      },
      set(n) {
        return (quatProxy.x = n)
      },
      configurable: true
    },
    y: {
      get() {
        return quatProxy.y
      },
      set(n) {
        return (quatProxy.y = n)
      },
      configurable: true
    },
    z: {
      get() {
        return quatProxy.z
      },
      set(n) {
        return (quatProxy.z = n)
      },
      configurable: true
    },
    w: {
      get() {
        return quatProxy.w
      },
      set(n) {
        return (quatProxy.w = n)
      },
      configurable: true
    },
    _x: {
      get() {
        return quatProxy.x
      },
      set(n) {
        return (quatProxy.x = n)
      },
      configurable: true
    },
    _y: {
      get() {
        return quatProxy.y
      },
      set(n) {
        return (quatProxy.y = n)
      },
      configurable: true
    },
    _z: {
      get() {
        return quatProxy.z
      },
      set(n) {
        return (quatProxy.z = n)
      },
      configurable: true
    },
    _w: {
      get() {
        return quatProxy.w
      },
      set(n) {
        return (quatProxy.w = n)
      },
      configurable: true
    }
  })
}

export const QuaternionProxyDirty = (
  quatProxy: QuaternionProxy,
  entity: Entity,
  dirty: Record<Entity, boolean>,
  initial = { x: 0, y: 0, z: 0, w: 1 }
) => {
  quatProxy.x = initial.x
  quatProxy.y = initial.y
  quatProxy.z = initial.z
  quatProxy.w = initial.w
  dirty[entity] = true
  return defineProperties(new Quaternion(), {
    x: {
      get() {
        return quatProxy.x
      },
      set(n) {
        dirty[entity] = true
        return (quatProxy.x = n)
      },
      configurable: true
    },
    y: {
      get() {
        return quatProxy.y
      },
      set(n) {
        dirty[entity] = true
        return (quatProxy.y = n)
      },
      configurable: true
    },
    z: {
      get() {
        return quatProxy.z
      },
      set(n) {
        dirty[entity] = true
        return (quatProxy.z = n)
      },
      configurable: true
    },
    w: {
      get() {
        return quatProxy.w
      },
      set(n) {
        dirty[entity] = true
        return (quatProxy.w = n)
      },
      configurable: true
    },
    _x: {
      get() {
        return quatProxy.x
      },
      set(n) {
        dirty[entity] = true
        return (quatProxy.x = n)
      },
      configurable: true
    },
    _y: {
      get() {
        return quatProxy.y
      },
      set(n) {
        dirty[entity] = true
        return (quatProxy.y = n)
      },
      configurable: true
    },
    _z: {
      get() {
        return quatProxy.z
      },
      set(n) {
        dirty[entity] = true
        return (quatProxy.z = n)
      },
      configurable: true
    },
    _w: {
      get() {
        return quatProxy.w
      },
      set(n) {
        dirty[entity] = true
        return (quatProxy.w = n)
      },
      configurable: true
    }
  })
}

export const Mat4Proxy = (mat4Proxy: Mat4Proxy) => {
  const mat4 = new Matrix4()
  mat4Proxy.set(mat4.elements)

  return defineProperties(mat4, {
    elements: {
      get() {
        return mat4Proxy
      },
      set(n) {
        return (mat4Proxy = n)
      },
      configurable: true
    }
  })
}

export const proxifyVector3 = (
  store: Vector3Store,
  entity: Entity,
  vector3 = new Vector3()
): Vector3 & ProxyExtensions => {
  // Set the initial values
  store.x[entity] = vector3.x
  store.y[entity] = vector3.y
  store.z[entity] = vector3.z
  return defineProperties(vector3 as Vector3 & ProxyExtensions, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    dirtyRecord: { value: {}, configurable: true, writable: true },
    x: {
      get() {
        return this.store.x[this.entity]
      },
      set(n) {
        return (this.store.x[this.entity] = n)
      },
      configurable: true
    },
    y: {
      get() {
        return this.store.y[this.entity]
      },
      set(n) {
        return (this.store.y[this.entity] = n)
      },
      configurable: true
    },
    z: {
      get() {
        return this.store.z[this.entity]
      },
      set(n) {
        return (this.store.z[this.entity] = n)
      },
      configurable: true
    }
  })
}

export const proxifyVector3WithDirty = (
  store: Vector3Store,
  entity: Entity,
  dirty: Record<Entity, boolean>,
  vector3 = new Vector3()
): Vector3 & ProxyExtensions => {
  // Set the initial values
  store.x[entity] = vector3.x
  store.y[entity] = vector3.y
  store.z[entity] = vector3.z
  dirty[entity] = true
  return defineProperties(vector3 as Vector3 & ProxyExtensions, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    dirtyRecord: { value: dirty, configurable: true, writable: true },
    x: {
      get() {
        return this.store.x[this.entity]
      },
      set(n) {
        this.dirtyRecord[this.entity] = true
        return (this.store.x[this.entity] = n)
      },
      configurable: true
    },
    y: {
      get() {
        return this.store.y[this.entity]
      },
      set(n) {
        this.dirtyRecord[this.entity] = true
        return (this.store.y[this.entity] = n)
      },
      configurable: true
    },
    z: {
      get() {
        return this.store.z[this.entity]
      },
      set(n) {
        this.dirtyRecord[this.entity] = true
        return (this.store.z[this.entity] = n)
      },
      configurable: true
    }
  })
}

export const proxifyQuaternion = (
  store: QuaternionStore,
  entity: Entity,
  quaternion = new Quaternion()
): Quaternion & ProxyExtensions => {
  // Set the initial values
  store.x[entity] = quaternion.x
  store.y[entity] = quaternion.y
  store.z[entity] = quaternion.z
  store.w[entity] = quaternion.w
  return defineProperties(quaternion as Quaternion & ProxyExtensions, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    dirtyRecord: { value: {}, configurable: true, writable: true },
    _x: {
      get() {
        return this.store.x[this.entity]
      },
      set(n) {
        return (this.store.x[this.entity] = n)
      },
      configurable: true
    },
    _y: {
      get() {
        return this.store.y[this.entity]
      },
      set(n) {
        return (this.store.y[this.entity] = n)
      },
      configurable: true
    },
    _z: {
      get() {
        return this.store.z[this.entity]
      },
      set(n) {
        return (this.store.z[this.entity] = n)
      },
      configurable: true
    },
    _w: {
      get() {
        return this.store.w[this.entity]
      },
      set(n) {
        return (this.store.w[this.entity] = n)
      },
      configurable: true
    }
  })
}

export const proxifyQuaternionWithDirty = (
  store: QuaternionStore,
  entity: Entity,
  dirty: Record<Entity, boolean>,
  quaternion = new Quaternion()
): Quaternion & ProxyExtensions => {
  // Set the initial values
  store.x[entity] = quaternion.x
  store.y[entity] = quaternion.y
  store.z[entity] = quaternion.z
  store.w[entity] = quaternion.w
  dirty[entity] = true
  return defineProperties(quaternion as Quaternion & ProxyExtensions, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    dirtyRecord: { value: dirty, configurable: true, writable: true },
    _x: {
      get() {
        return this.store.x[this.entity]
      },
      set(n) {
        this.dirtyRecord[this.entity] = true
        return (this.store.x[this.entity] = n)
      },
      configurable: true
    },
    _y: {
      get() {
        return this.store.y[this.entity]
      },
      set(n) {
        this.dirtyRecord[this.entity] = true
        return (this.store.y[this.entity] = n)
      },
      configurable: true
    },
    _z: {
      get() {
        return this.store.z[this.entity]
      },
      set(n) {
        this.dirtyRecord[this.entity] = true
        return (this.store.z[this.entity] = n)
      },
      configurable: true
    },
    _w: {
      get() {
        return this.store.w[this.entity]
      },
      set(n) {
        this.dirtyRecord[this.entity] = true
        return (this.store.w[this.entity] = n)
      },
      configurable: true
    }
  })
}
