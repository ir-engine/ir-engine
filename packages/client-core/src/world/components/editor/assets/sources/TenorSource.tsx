import VideoMediaSource from '../VideoMediaSource'
import { ItemTypes } from '../../dnd'
import VideoNode from '@xrengine/engine/src/editor/nodes/VideoNode'
import Api from '../../Api'
import i18n from 'i18next'

/**
 * TenorSource component used to provide visual objects.
 *
 * @author Robert Long
 * @type {class component}
 */
export class TenorSource extends VideoMediaSource {
  searchPlaceholder: string
  searchLegalCopy: string
  privacyPolicyUrl: string
  api: Api

  // initializing variables for this object
  constructor(api) {
    super(api)
    this.id = 'tenor'
    this.name = i18n.t('editor:sources.tenor.name')
    this.searchPlaceholder = i18n.t('editor:sources.tenor.ph-search')
    this.searchLegalCopy = i18n.t('editor:sources.tenor.search')
    this.privacyPolicyUrl = 'https://tenor.com/legal-privacy'
  }

  //function used to handle search and call API if there is any change in search input.
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
    return {
      results: results.map((result) => ({
        id: result.id,
        videoUrl: result && result.images && result.images.preview && result.images.preview.url,
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

export default TenorSource
