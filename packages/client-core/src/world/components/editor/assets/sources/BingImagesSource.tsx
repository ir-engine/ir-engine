import ImageMediaSource from '../ImageMediaSource'
import i18n from 'i18next'

/**
 * BingImagesSource component provides an explorer where we can seach images using search bar.
 *
 * @author Robert Long
 * @type {class component}
 */
export class BingImagesSource extends ImageMediaSource {
  id: string
  name: string
  searchLegalCopy: string
  privacyPolicyUrl: string

  //initializing variables
  constructor(api) {
    super(api)
    this.id = 'bing_images'
    this.name = i18n.t('editor:sources.bingImage.name')
    this.searchLegalCopy = i18n.t('editor:sources.bingImage.search')
    this.privacyPolicyUrl = 'https://privacy.microsoft.com/en-us/privacystatement'
  }
}

export default BingImagesSource
