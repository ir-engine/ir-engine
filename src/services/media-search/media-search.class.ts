import fetch from 'node-fetch'
import config from 'config'

import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'

interface Data {}

interface ServiceOptions {}

// interface MediaSearchQuery {
//   source: string
//   filter: string
//   cursor: number
//   q: string
//   collection: number
// }

export class MediaSearch implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  private readonly SKETCH_FAB_URL = 'https://api.sketchfab.com/v3/search';

  private readonly SKETCH_FAB_AUTH_TOKEN = config.get('sketchFab.authToken') ?? ''
  

  private readonly sketchFabDefaultOptions = {
    count: 24,
    max_face_count: 60000,
    max_filesizes: `gltf:${20 * 1024 * 1024}`,
    type: 'models',
    downloadable: true,
    processing_status: 'succeeded'
  }

  private readonly maxCollectionFaceCount = 200_000

  private readonly maxCollectionFileSizeBytes = `gltf:${100 * 1024 * 1024}`

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    const source = params?.query?.source
    let result
    switch (source) {
      case 'sketchfab':
        result = await this.searchSketchFabMedia(params?.query)
        break
    }
    return result
  }

  async get (id: Id, params?: Params): Promise<Data> {
    return {
      id, text: `A new message with ID: ${id}!`
    }
  }

  async create (data: Data, params?: Params): Promise<Data> {
    return await Promise.resolve({})
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }

  async searchSketchFabMedia (filterOptions: any): Promise<any> {
    const { source, filter, cursor, q, collection } = filterOptions

    const defaultFilters = {
      ...this.sketchFabDefaultOptions,
      cursor
    }

    // Collection filter
    if (collection) {
      Object.assign(defaultFilters, this.sketchFabCollectionQueryHandler(collection, q))
    }

    // Category Filter
    if (filter) {
      Object.assign(defaultFilters, this.sketchFabCategoryQueryHandler(filter, q))
    }

    const url = new URL(this.SKETCH_FAB_URL)
    Object.keys(defaultFilters).forEach(key => url.searchParams.append(key, defaultFilters[key]))

    return await fetch(url, { headers: { Authorization: this.SKETCH_FAB_AUTH_TOKEN } })
      .then(res => res.json())
      .then((response) => {
        return {
          meta: {
            source: source,
            next_cursor: response.cursors.next
          },
          entries: response.results.map(this.getAndProcessSketchFabResponse),
          suggestions: null
        }
      },
      (err) => {
        // TODO: Return error
        console.log(err)
      })
  }

  private getAndProcessSketchFabResponse (item: any): any {
    const preview = item.thumbnails.images.sort((a: any, b: any) => b.size - a.size)[0]

    const processedResponse = {
      type: 'sketchfab_model',
      id: item.uid,
      name: item.name,
      url: `https://sketchfab.com/models/${item.uid}`,
      attributions: { creator: { name: item.user.username, url: item.user.profileUrl } },
      images: {
        preview: {
          url: item.thumbnails.images.sort((a: any, b: any) => b.size - a.size)[0]
        }
      }
    }

    if (preview?.url) {
      processedResponse.images = {
        preview: {
          url: preview.url
        }
      }
    }
    return processedResponse
  }

  // Collection filter
  private sketchFabCollectionQueryHandler (collectionId: number, q: string): any {
    return {
      max_face_count: this.maxCollectionFaceCount,
      max_filesizes: this.maxCollectionFileSizeBytes,
      collection: collectionId,
      sort_by: !q || q === '' ? '-publishedAt' : ''
    }
  }

  // Category filter
  private sketchFabCategoryQueryHandler (category: string, q: string): any {
    const _categoryFilter: any = {
      categories: category
    }
    if (!q || q === '') {
      _categoryFilter.staffpicked = true
      _categoryFilter.sort_by = '-publishedAt'
    }

    // In case of featured filter, enable the staffpicked flag
    if (category === 'featured') {
      _categoryFilter.staffpicked = true
    }
    return _categoryFilter
  }
}
