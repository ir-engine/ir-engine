import { BadRequest } from '@feathersjs/errors'
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import Paginated from '../../types/PageObject'

interface Data {}
interface MediaType {
  [key: string]: { Handler: any; mediaType: string; modelId: string }
}

interface ServiceOptions {}
/**
 * A class for Resolve Media service
 *
 * @author Vyacheslav Solovjov
 */

export class ResolveMedia implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  models: any
  storage: any
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
    this.models = this.app.get('sequelizeClient').models
    this.storage = useStorageProvider().getStorage()
  }

  async setup() {}

  async find(params: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  async get(id: Id, params: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }

  async create(data: any, params: Params): Promise<Data> {
    // const StaticResourceModel = this.models.static_resource
    if (!data?.media?.url) {
      return await Promise.reject(new BadRequest('URL is required!'))
    }

    const SelectedMediaType = this.processAndGetMediaTypeHandler(data.media.url)
    const modelId = SelectedMediaType.modelId

    let model
    if (SelectedMediaType.Handler) {
      const selectedMediaInstance = new SelectedMediaType.Handler()
      model = await selectedMediaInstance.getModel(modelId)
    } else {
      model = {
        meta: {
          author: '',
          expected_content_type: 'model/gltf',
          name: ''
        },
        origin: data.media.url
      }
    }
    // Now stream that model to s3 and send the url to front end

    return model
  }

  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }

  private processAndGetMediaTypeHandler(mediaUrl: string): any {
    const url = new URL(mediaUrl)

    const mediaTypeMap: MediaType = {
      // TODO: Add more media types
    }

    let selectedMediaType: any = {}
    for (const key in mediaTypeMap) {
      if (mediaTypeMap[key]) {
        if (url.pathname.includes(key)) {
          selectedMediaType = mediaTypeMap[key]
          break
        }
      }
    }

    return selectedMediaType
  }
}
