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
import { State, useDidMount, useHookstate } from '@ir-engine/hyperflux'

import { ResourceState } from './ResourceState'

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
  const resourceState = useHookstate<TObj>(() => ResourceState.addResource(resource, uniqueID.value, entity))

  const unload = () => {
    ResourceState.unload(uniqueID.value, entity)
    if (onUnload) onUnload()
  }

  useEffect(() => {
    return () => {
      unload()
    }
  }, [])

  useDidMount(() => {
    unload()
    ResourceState.addResource(resourceState.value, uniqueID.value, entity)
  }, [resourceState])

  return [resourceState, unload]
}
