import { BaseSource } from './sources'
import { ItemTypes } from '../../constants/AssetTypes'
import VideoSourcePanel from './VideoSourcePanel'
import VideoNode from '../../nodes/VideoNode'
import { searchMedia } from '../../functions/searchMedia'

/**
 * VideoMediaSource used as parent class for Videos Source components like BingVideosSource.
 *
 * @author Robert Long
 * @type {class component}
 */
export class VideoMediaSource extends BaseSource {
  component: typeof VideoSourcePanel
  constructor() {
    super()
    this.component = VideoSourcePanel
  }

  /**
   * search used to search media source by calling Api.
   *
   * @author Robert Long
   * @param  {object}  params
   * @param  {[type]}  cursor
   * @param  {[type]}  abortSignal
   * @return {Promise}
   */
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
    return {
      results: results.map((result) => ({
        id: result.id,
        thumbnailUrl: result && result.images && result.images.preview && result.images.preview.url,
        label: result.name,
        type: ItemTypes.Video,
        url: result.url,
        nodeClass: VideoNode,
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

export default VideoMediaSource
