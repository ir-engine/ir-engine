import { createGLTFLoader } from '../../src/assets/functions/createGLTFLoader'
import { GLTF } from '../../src/assets/loaders/gltf/GLTFLoader'
import fs from 'fs'
import path from 'path'
import appRootPath from 'app-root-path'
import './patchBrowserForNode.ts'

const toArrayBuffer = (buf) => {
  const arrayBuffer = new ArrayBuffer(buf.length)
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return arrayBuffer
}

export const loadGLTFAssetNode = async (assetPath: string): Promise<GLTF> => {
  const assetPathAbsolute = path.join(appRootPath.path, assetPath)
  const loader = createGLTFLoader(true)
  const modelBuffer = toArrayBuffer(await fs.promises.readFile(assetPathAbsolute))
  return new Promise((resolve, reject) => loader.parse(modelBuffer, './', resolve, reject))
}
