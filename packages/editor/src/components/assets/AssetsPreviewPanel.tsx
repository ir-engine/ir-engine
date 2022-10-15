import React, { useImperativeHandle, useState } from 'react'
import styled from 'styled-components'

import { onWindowResize } from '@xrengine/client-core/src/user/components/UserMenu/menus/helperFunctions'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'
import createReadableTexture from '@xrengine/engine/src/assets/functions/createReadableTexture'
import { useHookstate } from '@xrengine/hyperflux'

import { AudioPreviewPanel } from './AssetPreviewPanels/AudioPreviewPanel'
import { ImagePreviewPanel } from './AssetPreviewPanels/ImagePreviewPanel'
import { JsonPreviewPanel } from './AssetPreviewPanels/JsonPreviewPanel'
import { camera, renderer, scene } from './AssetPreviewPanels/ModelPreviewPanel'
import { ModelPreviewPanel } from './AssetPreviewPanels/ModelPreviewPanel'
import { PreviewUnavailable } from './AssetPreviewPanels/PreviewUnavailable'
import { TxtPreviewPanel } from './AssetPreviewPanels/TxtPreviewPanel'
import { VedioPreviewPanel } from './AssetPreviewPanels/VedioPreviewPanel'

const AssetHeading = (styled as any).div`
  text-align: center;
  font-size: 0.9rem;
  padding-bottom: 10px;
  color: #f1f1f1;
`

interface Props {
  hideHeading?: boolean
}

export type AssetSelectionChangePropsType = {
  resourceUrl: string
  name: string
  contentType: string
}

/**
 * Used to see the Preview of the Asset in the FileBrowser Panel
 */

export const AssetsPreviewPanel = React.forwardRef(({ hideHeading }: Props, ref) => {
  useImperativeHandle(ref, () => ({ onLayoutChanged, onSelectionChanged }))
  const [previewPanel, usePreviewPanel] = useState({
    PreviewSource: null as any,
    resourceProps: { resourceUrl: '', name: '' }
  })

  const thumbnail = useHookstate('')

  const onLayoutChanged = () => {
    if (renderer) onWindowResize({ camera, renderer, scene })
  }

  const onSelectionChanged = async (props: AssetSelectionChangePropsType) => {
    thumbnail.value && URL.revokeObjectURL(thumbnail.value)
    if (/ktx2$/.test(props.resourceUrl)) {
      const texture = await AssetLoader.loadAsync(props.resourceUrl)
      thumbnail.set((await createReadableTexture(texture, { url: true })) as string)
    } else {
      thumbnail.set('')
    }
    renderPreview(props)
  }

  const renderPreview = (props) => {
    switch (props.contentType) {
      case 'model/gltf':
      case 'model/gltf-binary':
      case 'model/glb':
      case AssetType.glB:
      case AssetType.glTF:
      case 'gltf-binary':
      case AssetType.USDZ:
      case AssetType.FBX:
        const modelPreviewPanel = {
          PreviewSource: ModelPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(modelPreviewPanel)
        break
      case 'image/png':
      case 'image/jpeg':
      case 'png':
      case 'jpeg':
      case 'jpg':
        const imagePreviewPanel = {
          PreviewSource: ImagePreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(imagePreviewPanel)
        break
      case 'ktx2':
      case 'image/ktx2':
        const compImgPreviewPanel = {
          PreviewSource: ImagePreviewPanel,
          resourceProps: { resourceUrl: thumbnail.value, name: props.name }
        }
        usePreviewPanel(compImgPreviewPanel)
        break

      case 'video/mp4':
      case 'mp4':
        const vedioPreviewPanel = {
          PreviewSource: VedioPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(vedioPreviewPanel)
        break
      case 'audio/mpeg':
      case 'mpeg':
      case 'mp3':
        const audioPreviewPanel = {
          PreviewSource: AudioPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(audioPreviewPanel)
        break
      case 'md':
      case 'ts':
        const txtPreviewPanel = {
          PreviewSource: TxtPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(txtPreviewPanel)
        break
      case 'json':
        const jsonPreviewPanel = {
          PreviewSource: JsonPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(jsonPreviewPanel)
        break

      default:
        const unavailable = {
          PreviewSource: PreviewUnavailable,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(unavailable)
        break
    }
  }

  return (
    <>
      {!hideHeading && <AssetHeading>{previewPanel.resourceProps.name}</AssetHeading>}

      {previewPanel.PreviewSource && <previewPanel.PreviewSource resourceProps={previewPanel.resourceProps} />}
    </>
  )
})
