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

import { useEffect } from 'react'
import { DefaultLoadingManager, LoadingManager } from 'three'

import { defineState, getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'
import { ResourceManager, ResourceState, ResourceStatus } from '@etherealengine/spatial/src/resources/ResourceState'

import { ResourceLoadingManager } from '../loaders/base/ResourceLoadingManager'

export const setDefaultLoadingManager = (
  loadingManager: LoadingManager = new ResourceLoadingManager(
    onItemStart,
    onStart,
    onLoad,
    onProgress,
    onError
  ) as LoadingManager
) => {
  DefaultLoadingManager.itemStart = loadingManager.itemStart
  DefaultLoadingManager.itemEnd = loadingManager.itemEnd
  DefaultLoadingManager.itemError = loadingManager.itemError
  DefaultLoadingManager.resolveURL = loadingManager.resolveURL
  DefaultLoadingManager.setURLModifier = loadingManager.setURLModifier
  DefaultLoadingManager.addHandler = loadingManager.addHandler
  DefaultLoadingManager.removeHandler = loadingManager.removeHandler
  DefaultLoadingManager.getHandler = loadingManager.getHandler
}

const onItemStart = (url: string) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    // console.warn('ResourceManager: asset loaded outside of the resource manager, url: ' + url)
    return
  }

  const resource = resources[url]
  if (resource.status.value === ResourceStatus.Unloaded) {
    resource.status.set(ResourceStatus.Loading)
  }
}

const onStart = (url: string, loaded: number, total: number) => {}
const onLoad = () => {
  const debug = getState(ResourceState).debug
  if (debug) {
    const totalSize = ResourceManager.budgets.getTotalSizeOfResources()
    const totalVerts = ResourceManager.budgets.getTotalVertexCount()
    const totalBuff = ResourceManager.budgets.getTotalBufferSize()
    ResourceState.debugLog(
      `ResourceState:onLoad: Loaded ${totalSize} bytes of resources, ${totalVerts} vertices, ${totalBuff} bytes in buffer`
    )
  }
}

const onProgress = (url: string, loaded: number, total: number) => {}
const onError = (url: string) => {}

export const ResourceLoadingManagerState = defineState({
  name: 'ResourceLoadingManagerState',
  initial: () => new ResourceLoadingManager(onItemStart, onStart, onLoad, onProgress, onError),
  reactor: () => {
    const resourceLoadingManager = useMutableState(ResourceLoadingManagerState)

    useEffect(() => {
      setDefaultLoadingManager(resourceLoadingManager.value as LoadingManager)
    }, [resourceLoadingManager])
  },
  initialize: () => {
    // This is for getting around this file being removed during tree shaking
    getState(ResourceLoadingManagerState)
  }
})
