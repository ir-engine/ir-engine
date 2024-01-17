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

import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'
import { Entity } from '../../ecs/classes/Entity'
import { AssetLoader, LoadingArgs } from '../classes/AssetLoader'

//@ts-ignore
THREE.Cache.enabled

//@ts-ignore
THREE.DefaultLoadingManager.onLoad = () => {
  const totalSize = getCurrentSizeOfResources()
  console.log('Loaded: ' + totalSize + ' bytes of resources')
}

//Called when the item at the url passed in has completed loading
//@ts-ignore
THREE.DefaultLoadingManager.onProgress = (url: string, loaded: number, total: number) => {
  console.log('On Progress', url, loaded, total)
}

//@ts-ignore
THREE.DefaultLoadingManager.onError = (url: string) => {
  console.log('On Error', url)
}

//This doesn't work as you might imagine, it is only called once, the url parameter is pretty much useless
//@ts-ignore
THREE.DefaultLoadingManager.onStart = (url: string, loaded: number, total: number) => {
  console.log('On Start', url, loaded, total)
}

enum ResourceStatus {
  Unloaded,
  Loading,
  Loaded,
  Error
}

export enum ResourceType {
  GLTF,
  Texture,
  Geometry,
  ECSData,
  Audio,
  Unknown
}

type Resource = {
  status: ResourceStatus
  type: ResourceType
  references: Entity[]
  assetRef?: any
  metadata: {
    size?: number
  }
  onGPU: boolean
}

export const ResourceState = defineState({
  name: 'ResourceManagerState',
  initial: () => ({
    resources: {} as Record<string, Resource>
  })
})

const getCurrentSizeOfResources = () => {
  let size = 0
  const resources = getState(ResourceState).resources
  for (const key in resources) {
    const resource = resources[key]
    if (resource.metadata.size) size += resource.metadata.size
  }

  return size
}

const load = (
  url: string,
  resourceType: ResourceType,
  entity: Entity,
  args: LoadingArgs,
  onLoad = (response: any) => {},
  onProgress = (request: ProgressEvent) => {},
  onError = (event: ErrorEvent | Error) => {}
) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    resources.merge({
      [url]: {
        status: ResourceStatus.Unloaded,
        type: resourceType,
        references: [entity],
        metadata: {},
        onGPU: false
      }
    })
  } else {
    resources[url].references.merge([entity])
  }

  const resource = resources[url]

  AssetLoader.load(
    url,
    args,
    (response) => {
      resource.status.set(ResourceStatus.Loaded)
      resource.assetRef.set(response)
      onLoad(response)
    },
    (request) => {
      resource.status.set(ResourceStatus.Loading)
      resource.metadata.size.set(request.total)
      onProgress(request)
    },
    (error) => {
      resource.status.set(ResourceStatus.Error)
      onError(error)
    }
  )
}

export const ResourceManager = {
  load
}
