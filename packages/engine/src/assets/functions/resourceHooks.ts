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
  //Called when the asset url is changed, mostly useful for editor functions when changing an asset
  onUnload: (url: string) => void = (url: string) => {}
): [State<T | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  const urlState = useHookstate<string>(url)
  const value = useHookstate<T | null>(null)
  const error = useHookstate<ErrorEvent | Error | null>(null)
  const progress = useHookstate<ProgressEvent<EventTarget> | null>(null)

  const unload = () => {
    ResourceManager.unload(url, resourceType, entity)
  }

  useEffect(() => {
    let unmounted = false
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
        if (!unmounted) value.set(response as T)
      },
      (request) => {
        if (!unmounted) progress.set(request)
      },
      (err) => {
        if (!unmounted) error.set(err)
      }
    )

    return () => {
      unmounted = true
    }
  }, [url])

  return [value, unload, error, progress]
}

function useBatchLoader<T>(
  urls: string[],
  resourceType: ResourceType,
  entity: Entity = UndefinedEntity,
  params: LoadingArgs = {}
): [State<T[]>, () => void, State<(ErrorEvent | Error)[]>, State<ProgressEvent<EventTarget>[]>] {
  const values = useHookstate<T[]>([])
  const errors = useHookstate<(ErrorEvent | Error)[]>([])
  const progress = useHookstate<ProgressEvent<EventTarget>[]>([])

  const unload = () => {
    for (const url of urls) ResourceManager.unload(url, resourceType, entity)
  }

  useEffect(() => {
    let unmounted = false

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      ResourceManager.load(
        url,
        resourceType,
        entity,
        params,
        (response) => {
          if (!unmounted) values[i].set(response as T)
        },
        (request) => {
          if (!unmounted) progress[i].set(request)
        },
        (err) => {
          if (!unmounted) errors[i].set(err)
        }
      )
    }

    return () => {
      unmounted = true
    }
  }, [JSON.stringify(urls)])

  return [values, unload, errors, progress]
}

export function useGLTF(
  url: string,
  entity?: Entity,
  params?: LoadingArgs,
  onUnload?: (url: string) => void
): [State<GLTF | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  return useLoader<GLTF>(url, ResourceType.GLTF, entity, params, onUnload)
}

export function useBatchGLTF(
  urls: string[],
  entity?: Entity,
  params?: LoadingArgs
): [State<GLTF[]>, () => void, State<(ErrorEvent | Error)[]>, State<ProgressEvent<EventTarget>[]>] {
  return useBatchLoader<GLTF>(urls, ResourceType.GLTF, entity, params)
}

export function useTexture(
  url: string,
  entity?: Entity,
  params?: LoadingArgs,
  onUnload?: (url: string) => void
): [State<Texture | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  return useLoader<Texture>(url, ResourceType.Texture, entity, params, onUnload)
}
