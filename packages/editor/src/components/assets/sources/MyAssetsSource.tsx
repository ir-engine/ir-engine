import AudioNode from '@xrengine/editor/src/nodes/AudioNode'
import ImageNode from '@xrengine/editor/src/nodes/ImageNode'
import ModelNode from '@xrengine/editor/src/nodes/ModelNode'
import VideoNode from '@xrengine/editor/src/nodes/VideoNode'
import i18n from 'i18next'
import { searchMedia } from '@xrengine/engine/src/scene/functions/searchMedia'
import { deleteAsset } from '@xrengine/engine/src/scene/functions/deleteAsset'
import { uploadAssets } from '@xrengine/engine/src/scene/functions/upload'

import { ItemTypes } from '../../dnd'
import Editor from '../../Editor'
import { AcceptsAllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import UploadSourcePanel from '../UploadSourcePanel'
import { BaseSource } from './index'
const assetTypeToNode = {
  model: ModelNode,
  image: ImageNode,
  video: VideoNode,
  audio: AudioNode
}
const assetTypeToItemType = {
  model: ItemTypes.Model,
  image: ItemTypes.Image,
  video: ItemTypes.Video,
  audio: ItemTypes.Audio
}
export class MyAssetsSource extends BaseSource {
  component: typeof UploadSourcePanel
  editor: Editor
  tags: { label: string; value: string }[]
  searchLegalCopy: string
  privacyPolicyUrl: string
  uploadMultiple: boolean
  acceptFileTypes: string
  constructor(editor) {
    super()
    this.component = UploadSourcePanel
    this.editor = editor
    this.id = 'assets'
    this.name = i18n.t('editor:sources.myAssets.name')
    this.tags = [
      { label: 'Models', value: 'model' },
      { label: 'Images', value: 'image' },
      { label: 'Videos', value: 'video' },
      { label: 'Audio', value: 'audio' }
    ]
    this.searchLegalCopy = 'Search by Mozilla Hubs'
    this.privacyPolicyUrl = 'https://github.com/XRFoundation/XREngine/blob/master/PRIVACY.md'
    this.uploadSource = true
    this.uploadMultiple = true
    this.acceptFileTypes = AcceptsAllFileTypes
    this.requiresAuthentication = true
  }
  async upload(files, onProgress, abortSignal) {
    const assets = await uploadAssets(this.editor, files, onProgress, abortSignal)
    this.emit('resultsChanged')
    return assets
  }
  async delete(item) {
    await deleteAsset(item.id)
    this.emit('resultsChanged')
  }
  async search(params, cursor, abortSignal) {
    const { results, suggestions, nextCursor } = await searchMedia(
      this.id,
      {
        query: params.query,
        type: params.tags && params.tags.length > 0 && params.tags[0].value
      },
      cursor,
      abortSignal
    )
    return {
      results: results.map((result) => {
        const thumbnailUrl = result && result.images && result.images.preview && result.images.preview.url
        const nodeClass = assetTypeToNode[result.type]
        const iconComponent = thumbnailUrl
          ? null
          : this.editor.nodeEditors.get(nodeClass).WrappedComponent
          ? this.editor.nodeEditors.get(nodeClass).WrappedComponent.iconComponent
          : this.editor.nodeEditors.get(nodeClass).iconComponent
        return {
          id: result.id,
          thumbnailUrl,
          iconComponent,
          label: result.name,
          type: assetTypeToItemType[result.type],
          url: result.url,
          nodeClass,
          initialProps: {
            name: result.name,
            src: result.url
          }
        }
      }),
      suggestions,
      nextCursor,
      hasMore: !!nextCursor
    }
  }
}
export default MyAssetsSource
