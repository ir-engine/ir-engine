import AudioNode from '../../../nodes/AudioNode'
import ImageNode from '../../../nodes/ImageNode'
import ModelNode from '../../../nodes/ModelNode'
import VideoNode from '../../../nodes/VideoNode'
import i18n from 'i18next'
import { deleteAsset } from '../../../functions/deleteAsset'
import { uploadAssets } from '@xrengine/engine/src/scene/functions/upload'
import { searchMedia } from '../../../functions/searchMedia'
import { ItemTypes } from '../../../constants/AssetTypes'
import { AcceptsAllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import UploadSourcePanel from '../UploadSourcePanel'
import { BaseSource } from './index'
import { SceneManager } from '../../../managers/SceneManager'
import { CommandManager } from '../../../managers/CommandManager'
import EditorEvents from '../../../constants/EditorEvents'

/**
 * @author Abhishek Pathak
 */

export const UploadFileType = {
  gltf: ModelNode,
  'gltf-binary': ModelNode,
  png: ImageNode,
  jpeg: ImageNode,
  mp4: VideoNode,
  mpeg: AudioNode,
  'model/gltf-binary': ModelNode,
  'model/gltf': ModelNode,
  'image/png': ImageNode,
  'image/jpeg': ImageNode,
  'application/pdf': null,
  'video/mp4': VideoNode,
  'audio/mpeg': AudioNode,
  'audio/mp3': AudioNode,
  mp3: AudioNode
}

export class MyAssetsSource extends BaseSource {
  component: typeof UploadSourcePanel
  tags: { label: string; value: string }[]
  searchLegalCopy: string
  privacyPolicyUrl: string
  uploadMultiple: boolean
  acceptFileTypes: string
  constructor() {
    super()
    this.component = UploadSourcePanel
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
    const assets = await uploadAssets(SceneManager.instance, files, onProgress, abortSignal)
    CommandManager.instance.emitEvent(EditorEvents.RESULTS_CHANGED)
    return assets
  }
  async delete(item) {
    await deleteAsset(item.id)
    CommandManager.instance.emitEvent(EditorEvents.RESULTS_CHANGED)
  }

  async search(params, cursor, abortSignal) {
    const { results } = await searchMedia(
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
        return {
          project: result
        }
      }),
      suggestions: null,
      nextCursor: null,
      hasMore: false //!!nextCursor
    }
  }
}
export default MyAssetsSource
