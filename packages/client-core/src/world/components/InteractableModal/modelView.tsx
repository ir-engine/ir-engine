import React, { FunctionComponent } from 'react'
import '@google/model-viewer/dist/model-viewer'

type ModelViewProps = {
  modelUrl: string
  iosModelUrl?: string
}

/**
 *
 * @param modelUrl The URL to the 3D model. This parameter is required for model-viewer to display. Only glTF/GLB models are supported
 * @param iosModelUrl The url to a USDZ model which will be used on supported iOS 12+ devices via AR Quick Look on Safari.
 * @constructor
 */
export const ModelView: FunctionComponent<ModelViewProps> = ({ modelUrl, iosModelUrl }: ModelViewProps) => {
  return (
    // @ts-ignore
    <model-viewer
      style={{ width: '100%', height: '300px' }}
      src={modelUrl}
      ios-src={iosModelUrl}
      ar
      auto-rotate
      camera-controls
    />
  )
}

export default ModelView
