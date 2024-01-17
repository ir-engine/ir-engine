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
  params: LoadingArgs = {}
): [State<T | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  const value = useHookstate<T | null>(null)
  const error = useHookstate<ErrorEvent | Error | null>(null)
  const progress = useHookstate<ProgressEvent<EventTarget> | null>(null)

  useEffect(() => {
    if (!url) return
    ResourceManager.load(
      url,
      resourceType,
      entity,
      params,
      (response) => {
        value.set(response)
      },
      (request) => {
        progress.set(request)
      },
      (err) => {
        error.set(err)
      }
    )
  }, [url])

  const unload = () => {
    ResourceManager.unload(url, resourceType, entity)
  }

  return [value, unload, error, progress]
}

export function useGLTF(
  url: string,
  entity?: Entity,
  params?: LoadingArgs
): [State<GLTF | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  return useLoader<GLTF>(url, ResourceType.GLTF, entity, params)
}

export function useTexture(
  url: string,
  entity?: Entity,
  params?: LoadingArgs
): [State<Texture | null>, () => void, State<ErrorEvent | Error | null>, State<ProgressEvent<EventTarget> | null>] {
  return useLoader<Texture>(url, ResourceType.Texture, entity, params)
}
