import BasisuExporterExtension from '../exporters/gltf/extensions/BasisuExporterExtension'
import BufferHandlerExtension from '../exporters/gltf/extensions/BufferHandlerExtension'
import { EEECSExporterExtension } from '../exporters/gltf/extensions/EEECSExporterExtension'
import EEMaterialExporterExtension from '../exporters/gltf/extensions/EEMaterialExporterExtension'
import { ExporterExtension } from '../exporters/gltf/extensions/ExporterExtension'
import GPUInstancingExporterExtension from '../exporters/gltf/extensions/GPUInstancingExporterExtension'
import { LightmapExporterExtension } from '../exporters/gltf/extensions/LightmapExporterExtension'
import ResourceIDExtension from '../exporters/gltf/extensions/ResourceIDExtension'
import URLResolutionExtension from '../exporters/gltf/extensions/URLResolutionExtension'
import { GLTFExporter } from '../exporters/gltf/GLTFExporter'

export default function createGLTFExporter() {
  const exporter = new GLTFExporter()

  const extensions = [
    //LightmapExporterExtension,
    GPUInstancingExporterExtension,
    BasisuExporterExtension,
    EEMaterialExporterExtension,
    BufferHandlerExtension,
    URLResolutionExtension,
    EEECSExporterExtension,
    ResourceIDExtension
  ]

  extensions.forEach((extension) => exporter.register((writer) => new extension(writer)))
  return exporter
}
