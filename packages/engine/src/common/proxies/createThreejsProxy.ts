/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'

const { defineProperties } = Object

type Vector3Store = { x: Float64Array; y: Float64Array; z: Float64Array }
type QuaternionStore = { x: Float64Array; y: Float64Array; z: Float64Array; w: Float64Array }

export interface ProxyExtensions {
  entity: number
  store: Vector3Store | QuaternionStore
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
