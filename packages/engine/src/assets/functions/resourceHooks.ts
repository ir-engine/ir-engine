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

import { State, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Texture } from 'three'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { LoadingArgs } from '../classes/AssetLoader'
import { GLTF } from '../loaders/gltf/GLTFLoader'
import { ResourceManager, ResourceType } from '../state/ResourceState'

function useLoader<T>(
  url: string,
  resourceType: ResourceType,
  entity: Entity = UndefinedEntity,
  params: LoadingArgs = {},
  onUnload: (url: string) => void = (url: string) => {}
): [State<T | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  const urlState = useHookstate<string>(url)
  const value = useHookstate<T | null>(null)
  const error = useHookstate<ErrorEvent | Error | null>(null)
  const progress = useHookstate<ProgressEvent<EventTarget> | null>(null)

  const unload = () => {
    ResourceManager.unload(url, resourceType, entity)
    value.set(null)
    progress.set(null)
    error.set(null)
    onUnload(url)
  }

  useEffect(() => {
    if (url !== urlState.value) {
      ResourceManager.unload(urlState.value, resourceType, entity)
      value.set(null)
      progress.set(null)
      error.set(null)
      onUnload(urlState.value)
      urlState.set(url)
    }
    if (!url) return
    ResourceManager.load(
      url,
      resourceType,
      entity,
      params,
      (response) => {
        value.set(response as T)
      },
      (request) => {
        progress.set(request)
      },
      (err) => {
        error.set(err)
      }
    )
  }, [url])

  return [value, unload, error, progress]
}

export function useGLTF(
  url: string,
  entity?: Entity,
  params?: LoadingArgs,
  onUnload?: (url: string) => void
): [State<GLTF | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  return useLoader<GLTF>(url, ResourceType.GLTF, entity, params, onUnload)
}

export function useTexture(
  url: string,
  entity?: Entity,
  params?: LoadingArgs,
  onUnload?: (url: string) => void
): [State<Texture | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  return useLoader<Texture>(url, ResourceType.Texture, entity, params, onUnload)
}
