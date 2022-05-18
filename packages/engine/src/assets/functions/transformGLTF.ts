import { WebIO } from '@gltf-transform/core'
import { instance } from '@gltf-transform/functions'
import { DracoMeshCompression, KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'
import { DRACOLoader } from '../loaders/gltf/DRACOLoader'

async function instanceGLTF(url) {
  let dracoLoader: any = new DRACOLoader()
  dracoLoader.setDecoderPath('/loader_decoders/')
  const io = new WebIO().registerExtensions([DracoMeshCompression, ...KHRONOS_EXTENSIONS])

  let dracoDecoderModule = null
  await dracoLoader.getDecoderModule().then(function (module) {
    dracoDecoderModule = module.decoder
  })

  let dracoEncoderModule = null
  await dracoLoader.getEncoderModule().then(function (module) {
    dracoEncoderModule = module.encoder
  })

  io.registerDependencies({
    'draco3d.decoder': dracoDecoderModule,
    'draco3d.encoder': dracoEncoderModule
  })

  const doc = await io.read(url)

  // @ts-ignore
  await doc.transform(instance())

  // Remove draco mesh compression after transformation, as the output file is not going to be writtren to file
  let extensions = doc.getRoot().listExtensionsRequired()
  for (let index = 0; index < extensions.length; index++) {
    const extension = extensions[index]
    if (extension.extensionName === 'KHR_draco_mesh_compression') {
      extension.dispose()
    }
  }

  let buffer = await io.writeBinary(doc)
  return buffer
}

export { instanceGLTF }
