import { BaseSource } from './sources'
import { ItemTypes } from '../../constants/AssetTypes'
import InstagramSourcePanel from './InstagramSourcePanel'
import InstagramNode from '../../nodes/InstagramNode'
import { searchMedia } from '../../functions/searchMedia'

/**
 * InstagramMediaSource used to provide Instagram media by calling api.
 *
 * @author Robert Long
 * @type {class component}
 */
export class InstagramMediaSource extends BaseSource {
  //declaring component type of InstagramSourcePanel
  component: typeof InstagramSourcePanel

  //initializing component properties
  constructor() {
    super()
    this.component = InstagramSourcePanel
    debugger
  }

  // used to call api for searching media
  async search(params, cursor, abortSignal) {
    //initializing additional node properties object containing initialScale property
    const additionalNodeProps = {
      initialScale: 'fit'
    }

    // declaring additionalItemProps
    const additionalItemProps = {}

    // initializing query using params
    const queryParams = {
      query: params.query
    }

    // check if params contains tags and tags contains length greator then sizeRandomness
    // then initializing variable tags, paramsKey
    if (params.tags && params.tags.length > 0) {
      const tag = params.tags[0]
      const paramsKey = tag.paramsKey !== undefined ? tag.paramsKey : 'filter'
      queryParams[paramsKey] = tag.value

      // check if tag contains initialNodeProps then initializing additionalNodeProps
      if (tag.initialNodeProps) {
        Object.assign(additionalNodeProps, tag.initialNodeProps)
      }

      // check if tag contains itemProps then assign to additionalItemProps
      if (tag.itemProps) {
        Object.assign(additionalItemProps, tag.itemProps)
      }
    }

    // initializing results, suggestions, nextCursor by calling api
    const { results, suggestions, nextCursor } = await searchMedia(this.id, queryParams, cursor, abortSignal)

    debugger
    // retuning media search results
    return {
      results: results.map((result) => ({
        id: result.id,
        thumbnailUrl: result && result.images && result.images.preview && result.images.preview.url,
        label: result.name,
        type: ItemTypes.Instagram,
        url: result.url,
        nodeClass: InstagramNode,
        initialProps: {
          name: result.name,
          ...additionalNodeProps,
          src: result.url
        },
        ...additionalItemProps
      })),
      suggestions,
      nextCursor,
      hasMore: !!nextCursor
    }
  }
}

export default InstagramMediaSource
