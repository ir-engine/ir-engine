import { NodeIO, WebIO } from '@gltf-transform/core'
import { instance } from '@gltf-transform/functions'
import { DracoMeshCompression, KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'
import { getLoader } from './LoadGLTF'
import { isClient } from '../../common/functions/isClient'

async function instanceGLTF(url) {
  const dracoLoader = getLoader().dracoLoader!

  const io = new (isClient ? WebIO : NodeIO)().registerExtensions([DracoMeshCompression, ...KHRONOS_EXTENSIONS])
  io.registerDependencies({
    'draco3d.decoder': (await dracoLoader.getDecoderModule()).decoder,
    'draco3d.encoder': (await dracoLoader.getEncoderModule()).encoder
  })

  // TODO: this currently doesnt work - we need to be able to pass URLs into io.read in order for the URL to be passed

  const doc = await io.read(isClient ? url : new URL(url))
  await doc.transform(instance())

  // Remove draco mesh compression after transformation, as the output file is not going to be writtren to file
  let extensions = doc.getRoot().listExtensionsRequired()
  for (let index = 0; index < extensions.length; index++) {
    const extension = extensions[index]
    if (extension.extensionName === 'KHR_draco_mesh_compression') {
      extension.dispose()
    }
  }

  return io.writeBinary(doc)
}

export { instanceGLTF }
