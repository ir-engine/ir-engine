import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'
import { ResourceManager, ResourceState, ResourceStatus } from '@etherealengine/spatial/src/resources/ResourceState'
import { useEffect } from 'react'
import { DefaultLoadingManager, LoadingManager } from 'three'
import { ResourceLoadingManager } from '../loaders/base/ResourceLoadingManager'

export const ResourceLoadingManagerState = defineState({
  name: 'ResourceLoadingManagerState',
  initial: () => ({}),
  reactor: () => {
    useEffect(() => {
      setDefaultLoadingManager()
    }, [])
  }
})

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
