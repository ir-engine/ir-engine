import VideoMediaSource from '../VideoMediaSource'
import i18n from 'i18next'

/**
 * BingVideosSource componant used to provide a video explorer here we can seach bing videos used search bar.
 *
 * @author Robert Long
 * @type {class component}
 */
export class BingVideosSource extends VideoMediaSource {
  id: string
  name: string
  searchLegalCopy: string
  privacyPolicyUrl: string

  //initializing variables for this component
  constructor(api) {
    super(api)
    this.id = 'bing_videos'
    this.name = i18n.t('editor:sources.bingVideo.name')
    this.searchLegalCopy = i18n.t('editor:sources.bingImage.search')
    this.privacyPolicyUrl = 'https://privacy.microsoft.com/en-us/privacystatement'
  }
}

export default BingVideosSource
