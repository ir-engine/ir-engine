import fetch from 'node-fetch';
import config from '../../config';
import { BadRequest } from '@feathersjs/errors';

export default class GooglePolyMedia {
  private readonly GOOGLE_POLY_BASE_URL = 'https://poly.googleapis.com/v1'
  private readonly GOOGLE_POLY_ASSET_URL = `${this.GOOGLE_POLY_BASE_URL}/assets`

  private readonly GOOGLE_POLY_AUTH_TOKEN = config.server.googlePoly.authToken

  async searchGooglePolyMedia (filterOptions: any): Promise<any> {
    const { source, filter, cursor, q, pageSize } = filterOptions;

    const defaultFilters: any = {
      key: this.GOOGLE_POLY_AUTH_TOKEN,
      pageSize: pageSize,
      maxComplexity: 'MEDIUM',
      format: 'GLTF2'
    };

    if (cursor) {
      defaultFilters.pageToken = cursor;
    }
    if (filter) {
      defaultFilters.category = filter;
    }

    if (q) {
      defaultFilters.keywords = q;
    }

    const url = new URL(this.GOOGLE_POLY_ASSET_URL);
    Object.keys(defaultFilters).forEach(key => url.searchParams.append(key, defaultFilters[key]));
    return await fetch(url)
      .then(async (response: any) => {
        const statusCode = response?.error?.code;
        if (statusCode >= 400) {
          return await Promise.reject(new BadRequest(response.statusText, { status: response.status }));
        }

        const jsonResp: any = await response.json();
        return {
          meta: {
            source: source,
            next_cursor: jsonResp.nextPageToken
          },
          entries: jsonResp.assets.map(this.getAndProcessPolyResponse),
          suggestions: null
        };
      });
  }

  public async getModel (modelId: string): Promise<any> {
    try {
      return await fetch(`${this.GOOGLE_POLY_ASSET_URL}/${modelId}?key=${this.GOOGLE_POLY_AUTH_TOKEN}`)
        .then(async (response) => {
          if (response.status >= 400) {
            return await Promise.reject(new BadRequest(response.statusText, { status: response.status }));
          }

          const jsonResp: any = await response.json();
          return this.processDownloaddModelUrl(jsonResp);
        });
    } catch (err) {
      console.log('-->>>>', err);
    }
  }

  private processDownloaddModelUrl (modelItem: any): any {
    const item: any = {
      meta: {
        author: modelItem.authorName,
        expected_content_type: 'model/gltf',
        license: modelItem.license,
        name: modelItem.displayName || modelItem.name
      }
    };
    // First Priority is of GLTF2
    let selectedFormat = modelItem.formats.find((format: any) => {
      return format.formatType === 'GLTF2';
    });

    if (!selectedFormat) {
      selectedFormat = modelItem.formats.find((format: any) => {
        return format.formatType === 'GLTF';
      });
    }
    item.origin = selectedFormat?.root?.url;
    return item;
  }

  private getAndProcessPolyResponse (item: any): any {
    const name: string = item.name;
    const url: any = `https://poly.google.com/view/${name}`;
    const processedResponse = {
      type: 'poly_model',
      id: item.name,
      name: item.displayName || item.name,
      url: url.replace('assets/', ''),
      attributions: { creator: { name: item.authorName } },
      images: {
        preview: {
          url: item?.thumbnail?.url
        }
      }
    };
    return processedResponse;
  }
}
