import fetch from 'node-fetch'
import config from 'config'

export default class SketchFabMedia {
  private readonly GOOGLE_POLY_URL = 'https://poly.googleapis.com/v1/assets';

  private readonly GOOGLE_POLY_AUTH_TOKEN = config.get('googlePoly.authToken') ?? ''
  async searchGooglePolyMedia (filterOptions: any): Promise<any> {
    const { source, filter, cursor, q, pageSize } = filterOptions

    const defaultFilters: any = {
      key: this.GOOGLE_POLY_AUTH_TOKEN,
      pageSize: pageSize,
      maxComplexity: 'MEDIUM',
      format: 'GLTF2'
    }

    if (cursor) {
      defaultFilters.pageToken = cursor
    }
    if (filter) {
      defaultFilters.category = filter
    }

    if (q) {
      defaultFilters.keywords = q
    }

    const url = new URL(this.GOOGLE_POLY_URL)
    Object.keys(defaultFilters).forEach(key => url.searchParams.append(key, defaultFilters[key]))
    return await fetch(url)
      .then(res => res.json())
      .then((response) => {
        return {
          meta: {
            source: source,
            next_cursor: response.nextPageToken
          },
          entries: response.assets.map(this.getAndProcessPolyResponse),
          suggestions: null
        }
      })
  }

  private getAndProcessPolyResponse (item: any): any {

    const processedResponse = {
      type: 'poly_model',
      id: item.name,
      name: item.displayName,
      url: `https://poly.google.com/view/${item.name}`.replace('assets/', ''),
      attributions: { creator: { name: item.authorName } },
      images: {
        preview: {
          url: item?.thumbnail?.url
        }
      }
    }
    return processedResponse
  }
}
