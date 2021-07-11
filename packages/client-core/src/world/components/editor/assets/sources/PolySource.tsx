import ModelMediaSource from '../ModelMediaSource'
import { TransformPivot } from '@xrengine/engine/src/editor/controls/EditorControls'
import i18n from 'i18next'

/**
 * PolySource component used to provide visual objects using google poly.
 *
 * @author Robert Long
 * @type {class}
 */
export class PolySource extends ModelMediaSource {
  tags: { label: string; value: string }[]
  searchLegalCopy: string
  privacyPolicyUrl: string
  transformPivot: any

  // initializing variables for this component
  constructor(api) {
    super(api)
    this.id = 'poly'
    this.name = i18n.t('editor:sources.googlePoly.name')

    //array containing tag options
    this.tags = [
      { label: 'Featured', value: '' },
      { label: 'Animals', value: 'animals' },
      { label: 'Architecture', value: 'architecture' },
      { label: 'Art', value: 'art' },
      { label: 'Food', value: 'food' },
      { label: 'Nature', value: 'nature' },
      { label: 'Objects', value: 'objects' },
      { label: 'People', value: 'people' },
      { label: 'Scenes', value: 'scenes' },
      { label: 'Transport', value: 'transport' }
    ]
    this.searchLegalCopy = i18n.t('editor:sources.googlePoly.search')
    this.privacyPolicyUrl = 'https://policies.google.com/privacy'
    this.transformPivot = TransformPivot.Bottom
  }
}

export default PolySource
