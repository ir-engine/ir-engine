import { BaseSource } from './sources'
import { ItemTypes } from '../dnd'
import ImageSourcePanel from './ImageSourcePanel'
import ImageNode from '@xrengine/engine/src/editor/nodes/ImageNode'
import Api from '../Api'

/**
 * ImageMediaSource used to get image source by calling api.
 *
 * @author Robert Long
 * @type {class component}
 */
export class ImageMediaSource extends BaseSource {
  // declairing component as type ImageSourcePanel
  component: typeof ImageSourcePanel

  // declairing api with type of api class
  api: Api

  // initializing component properties
  constructor(api) {
    super()
    this.component = ImageSourcePanel
    this.api = api
  }

  //calling api to search media
  async search(params, cursor, abortSignal) {
    const { results, suggestions, nextCursor } = await this.api.searchMedia(
      this.id,
      {
        query: params.query,
        filter: params.tags && params.tags.length > 0 && params.tags[0].value
      },
      cursor,
      abortSignal
    )

    //returning object containing image data
    return {
      results: results.map((result) => ({
        id: result.id,
        thumbnailUrl: result && result.images && result.images.preview && result.images.preview.url,
        label: result.name,
        type: ItemTypes.Image,
        url: result.url,
        nodeClass: ImageNode,
        initialProps: {
          name: result.name,
          src: result.url
        }
      })),
      suggestions,
      nextCursor,
      hasMore: !!nextCursor
    }
  }
}

export default ImageMediaSource
