import BasisuExporterExtension from '../exporters/gltf/extensions/BasisuExporterExtension'
import { ExporterExtension } from '../exporters/gltf/extensions/ExporterExtension'
import GPUInstancingExporterExtension from '../exporters/gltf/extensions/GPUInstancingExporterExtension'
import { LightmapExporterExtension } from '../exporters/gltf/extensions/LightmapExporterExtension'
import { GLTFExporter } from '../exporters/gltf/GLTFExporter'

export default function createGLTFExporter() {
  const exporter = new GLTFExporter()

  const extensions = [LightmapExporterExtension, GPUInstancingExporterExtension, BasisuExporterExtension]

  extensions.forEach((extension) => exporter.register((writer) => new extension(writer)))
  return exporter
}
