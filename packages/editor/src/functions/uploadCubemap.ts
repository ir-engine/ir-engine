import { upload } from '@xrengine/client-core/src/util/upload'
import { convertCubemapToEquiImageData } from '@xrengine/engine/src/scene/classes/ImageUtils'
import { WebGLCubeRenderTarget, WebGLRenderer } from 'three'

export const uploadCubemap = async (
  renderer: WebGLRenderer,
  source: WebGLCubeRenderTarget,
  resoulution: number,
  fileIdentifier?: string,
  projectID?: any
) => {
  const blob = (await convertCubemapToEquiImageData(renderer, source, resoulution, resoulution, true)).blob
  const value = (await upload(blob, null, null, fileIdentifier, projectID)) as any

  return value
}
