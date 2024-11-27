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

import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Entity, UndefinedEntity } from '@ir-engine/ecs'
import { NO_PROXY, State, useDidMount, useHookstate } from '@ir-engine/hyperflux'

import { DisposableObject, ResourceAssetType, ResourceManager } from './ResourceState'

/**
 *
 * Loader hook for creating an instance of a class that implements the DisposableObject interface in ResourceState.ts in a React context,
 * but has it's lifecycle managed by the ResourceManager in ResourceState.ts
 *
 * @deprecated in favor of useResource
 * @param disposableLike A class that implements the DisposableObject interface eg. DirectionalLight
 * @param entity *Optional* the entity that is loading the object
 * @param args *Optional* arguments to pass to the constructor of disposableLike
 * @returns A unique instance of the class that is passed in for DisposableObject
 */
export function useDisposable<T extends DisposableObject, T2 extends new (...params: any[]) => T>(
  disposableLike: T2,
  entity: Entity,
  ...args: ConstructorParameters<T2>
): [InstanceType<T2>, () => void] {
  const classState = useHookstate(() => disposableLike)
  const objState = useHookstate<InstanceType<T2>>(() => ResourceManager.loadObj(disposableLike, entity, ...args))

  const unload = () => {
    if (objState.value) {
      ResourceManager.unload(ResourceManager.getResourceID(objState.get(NO_PROXY)), entity)
    }
  }

  useEffect(() => {
    return unload
  }, [])

  useEffect(() => {
    if (disposableLike !== classState.value) {
      unload()
      classState.set(() => disposableLike)
      objState.set(() => ResourceManager.loadObj(disposableLike, entity, ...args))
    }
  }, [disposableLike])

  return [objState.get(NO_PROXY) as InstanceType<T2>, unload]
}

/**
 *
 * Loader hook for creating an instance of a class that extends DisposableObject in a non-React context,
 * Tracked by the ResourceManager in ResourceState.ts, but will not be unloaded unless the unload function that is returned is called
 * Useful for when you only want to create the object if a condition is met (eg. is debug enabled)
 *
 * @param disposableLike A class that implements the DisposableObject interface in ResourceState.ts eg. DirectionalLight
 * @param entity *Optional* the entity that is loading the object
 * @param args *Optional* arguments to pass to the constructor of k
 * @returns A unique instance of the class that is passed in for object3D and a callback to unload the object
 */
export function createDisposable<T extends DisposableObject, T2 extends new (...params: any[]) => T>(
  disposableLike: T2,
  entity: Entity,
  ...args: ConstructorParameters<T2>
): [InstanceType<T2>, () => void] {
  const obj = ResourceManager.loadObj(disposableLike, entity, ...args)

  const unload = () => {
    ResourceManager.unload(ResourceManager.getResourceID(obj), entity)
  }

  return [obj, unload]
}

export type ObjOrFunction<T> = T | (() => T)
/**
 *
 * Hook to add any resource to be tracked by the resource manager
 * If the resource has a cleanup method that isn't called 'dispose', you'll need to pass in a callback function for onUnload to manage the cleanup
 *
 * @param resource the resource to track
 * @param entity *Optional* the entity that is loading the object
 * @param id *Optional* a unique id to track the resource with, a UUID will be created if an id is not provided
 * @param onUnload *Optional* a callback called when the resource is unloaded
 * @returns the resource object passed in
 */
export function useResource<TObj>(
  resource: ObjOrFunction<TObj>,
  entity: Entity = UndefinedEntity,
  onUnload?: () => void
): [State<TObj>, () => void] {
  const uniqueID = useHookstate<string>(uuidv4)
  const resourceState = useHookstate<TObj>(() => ResourceManager.addResource(resource, uniqueID.value, entity))

  const unload = () => {
    ResourceManager.unload(uniqueID.value, entity)
    if (onUnload) onUnload()
  }

  useEffect(() => {
    return () => {
      unload()
    }
  }, [])

  useDidMount(() => {
    unload()
    ResourceManager.addResource(resourceState.value, uniqueID.value, entity)
  }, [resourceState])

  return [resourceState, unload]
}

export function useReferencedResource<Asset>(
  resource: ObjOrFunction<Asset>,
  assetKey: string,
  onUnload?: () => void
): [State<Asset>, () => void] {
  const resourceState = useHookstate<Asset>(resource)

  const unload = () => {
    const resourceValue = resourceState.value as ResourceAssetType
    if (resourceValue) ResourceManager.removeReferencedAsset(assetKey, resourceValue)
    if (onUnload) onUnload()
  }

  useEffect(() => {
    const resourceValue = resourceState.value as ResourceAssetType
    if (resourceValue) {
      ResourceManager.addReferencedAsset(assetKey, resourceValue)
      return unload
    }
  }, [resourceState])

  return [resourceState, unload]
}
