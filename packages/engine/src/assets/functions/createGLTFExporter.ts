import BasisuExporterExtension from '../exporters/gltf/extensions/BasisuExporterExtension'
import BufferHandlerExtension from '../exporters/gltf/extensions/BufferHandlerExtension'
import { EEECSExporterExtension } from '../exporters/gltf/extensions/EEECSExporterExtension'
import EEMaterialExporterExtension from '../exporters/gltf/extensions/EEMaterialExporterExtension'
import GPUInstancingExporterExtension from '../exporters/gltf/extensions/GPUInstancingExporterExtension'
import ResourceIDExtension from '../exporters/gltf/extensions/ResourceIDExtension'
import URLResolutionExtension from '../exporters/gltf/extensions/URLResolutionExtension'
import { GLTFExporter, GLTFWriter } from '../exporters/gltf/GLTFExporter'

export default function createGLTFExporter() {
  const exporter = new GLTFExporter()

  const extensions = [
    //LightmapExporterExtension,
    GPUInstancingExporterExtension,
    //BasisuExporterExtension,
    EEMaterialExporterExtension,
    //BufferHandlerExtension,
    URLResolutionExtension,
    EEECSExporterExtension,
    ResourceIDExtension
  ]
  extensions.forEach((extension) => exporter.register((writer) => new extension(writer)))

  //create persistent instances of basisu and buffer extensions to maintain cache
  const basisUExtension = new BasisuExporterExtension(new GLTFWriter())
  exporter.register((writer) => {
    basisUExtension.writer = writer
    return basisUExtension
  })
  const bufferHandlerExtension = new BufferHandlerExtension(new GLTFWriter())
  exporter.register((writer) => {
    bufferHandlerExtension.writer = writer
    return bufferHandlerExtension
  })

  return exporter
}
