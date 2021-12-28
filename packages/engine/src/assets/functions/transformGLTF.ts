import { Document, NodeIO, PlatformIO, WebIO } from '@gltf-transform/core'
import { instance } from '@gltf-transform/functions'
import { DracoMeshCompression, KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'
import { getLoader } from './LoadGLTF'
import { isClient } from '../../common/functions/isClient'

export async function instanceGLTF(url) {
  const dracoLoader = getLoader().dracoLoader!

  console.log('instanceGLTF', url)

  let io: PlatformIO

  if (isClient) {
    io = new WebIO()
  } else {
    io = new NodeIO()
    ;(io as NodeIO).useFetch = true
  }
  io.registerExtensions([DracoMeshCompression, ...KHRONOS_EXTENSIONS])
  io.registerDependencies({
    'draco3d.decoder': (await dracoLoader.getDecoderModule()).decoder,
    'draco3d.encoder': (await dracoLoader.getEncoderModule()).encoder
  })

  // TODO: this currently doesnt work - we need to be able to pass URLs into io.read in order for the URL to be passed

  const doc = (await io.read(url)) as Document
  await doc.transform(instance())

  // Remove draco mesh compression after transformation, as the output file is not going to be writtren to file
  let extensions = doc.getRoot().listExtensionsRequired()
  for (let index = 0; index < extensions.length; index++) {
    const extension = extensions[index]
    if (extension.extensionName === 'KHR_draco_mesh_compression') {
      extension.dispose()
    }
  }

  const { json } = await io.writeJSON(doc)
  console.log(json)
  return JSON.stringify(json)
}
