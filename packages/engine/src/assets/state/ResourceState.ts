import { defineState, getMutableState } from '@etherealengine/hyperflux'
import { Entity } from '../../ecs/classes/Entity'
import { AssetLoader, LoadingArgs } from '../classes/AssetLoader'

//@ts-ignore
THREE.Cache.enabled

//@ts-ignore
THREE.DefaultLoadingManager.onLoad = () => {
  console.log('On Load')
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

const load = (
  entity: Entity,
  resourceType: ResourceType,
  url: string,
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
