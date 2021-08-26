import React, { useImperativeHandle, useState } from 'react'
import { ViewportContainer } from '../viewport/ViewportPanelContainer'
import { ImagePreviewPanel } from './AssetPreviewPanels/ImagePreviewPanel'
import { ModelPreviewPanel } from './AssetPreviewPanels/ModelPreviewPanel'
/**
 * Used to see the Preview of the Asset in the FileBrowser Panel
 *
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

export const AssetsPreviewPanel = React.forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({ onLayoutChanged, onSelectionChanged }))
  const [layoutStateChanged, useLayoutStateChanged] = useState(0)
  const [previewPanel, usePreviewPanel] = useState({
    PreviewSource: null,
    resourceProps: { resourceUrl: '', name: '' }
  })

  const onLayoutChanged = () => {
    console.log('Layout is Changed:')
  }

  const onSelectionChanged = (props) => {
    renderPreview(props)
  }

  const renderPreview = (props) => {
    console.log('Render Preview Function')
    switch (props.contentType) {
      case 'model/gltf':
      case 'model/gltf-binary':
        const modelPreviewPanel = {
          PreviewSource: ModelPreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(modelPreviewPanel)
        break
      case 'image/png':
      case 'image/jpeg':
        const imagePreviewPanel = {
          PreviewSource: ImagePreviewPanel,
          resourceProps: { resourceUrl: props.resourceUrl, name: props.name }
        }
        usePreviewPanel(imagePreviewPanel)
        break
    }
  }

  return (
    <>
      {console.log('Rendering Asset Preview Panel')}
      <h1>{previewPanel.resourceProps.name}</h1>
      <ViewportContainer>
        {previewPanel.PreviewSource && <previewPanel.PreviewSource resourceProps={previewPanel.resourceProps} />}
      </ViewportContainer>
    </>
  )
})
