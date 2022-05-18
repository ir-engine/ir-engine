import React, { useImperativeHandle, useState } from 'react'
import styled from 'styled-components'

import { onWindowResize } from '@xrengine/client-core/src/user/components/UserMenu/menus/helperFunctions'

import { AudioPreviewPanel } from './AssetPreviewPanels/AudioPreviewPanel'
import { ImagePreviewPanel } from './AssetPreviewPanels/ImagePreviewPanel'
import { JsonPreviewPanel } from './AssetPreviewPanels/JsonPreviewPanel'
import { camera, renderer, scene } from './AssetPreviewPanels/ModelPreviewPanel'
import { ModelPreviewPanel } from './AssetPreviewPanels/ModelPreviewPanel'
import { PreviewUnavailable } from './AssetPreviewPanels/PreviewUnavailable'
import { TxtPreviewPanel } from './AssetPreviewPanels/TxtPreviewPanel'
import { VedioPreviewPanel } from './AssetPreviewPanels/VedioPreviewPanel'

/**
 *
 * @author Abhishek Pathak
 */

const AssetHeading = styled.div`
  text-align: center;
  font-size: 150%;
  padding-bottom: 20px;
  color: #f1f1f1;
`

export type AssetSelectionChangePropsType = {
  resourceUrl: string
  name: string
  contentTypes: string
}

/**
 * Used to see the Preview of the Asset in the FileBrowser Panel
 *
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

export const AssetsPreviewPanel = React.forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({ onLayoutChanged, onSelectionChanged }))
  const [previewPanel, usePreviewPanel] = useState({
    PreviewSource: null as any,
    resourceProps: { resourceUrl: '', name: '' }
  })

  const onLayoutChanged = () => {
    if (renderer) onWindowResize({ camera, renderer, scene })
  }

  const onSelectionChanged = (props: AssetSelectionChangePropsType) => {
    renderPreview(props)
  }

  const renderPreview = (props) => {
    switch (props.contentType) {
      case 'model/gltf':
      case 'model/gltf-binary':
      case 'model/glb':
      case 'glb':
      case 'gltf':
      case 'gltf-binary':
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
      <div>
        <AssetHeading>{previewPanel.resourceProps.name}</AssetHeading>
      </div>
      {previewPanel.PreviewSource && <previewPanel.PreviewSource resourceProps={previewPanel.resourceProps} />}
    </>
  )
})
