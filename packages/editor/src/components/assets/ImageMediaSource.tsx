import { BaseSource } from './sources'
import { ItemTypes } from '../../constants/AssetTypes'
import ImageSourcePanel from './ImageSourcePanel'
import ImageNode from '../../nodes/ImageNode'
import { searchMedia } from '../../functions/searchMedia'

/**
 * ImageMediaSource used to get image source by calling api.
 *
 * @author Robert Long
 * @type {class component}
 */
export class ImageMediaSource extends BaseSource {
  // declaring component as type ImageSourcePanel
  component: typeof ImageSourcePanel

  // initializing component properties
  constructor() {
    super()
    this.component = ImageSourcePanel
  }

  //calling api to search media
  async search(params, cursor, abortSignal) {
    const { results, suggestions, nextCursor } = await searchMedia(
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
