import GPUInstancingExporterExtension from '../exporters/gltf/extensions/GPUInstancingExporterExtension'
import { LightmapExporterExtension } from '../exporters/gltf/extensions/LightmapExporterExtension'
import { GLTFExporter } from '../exporters/gltf/GLTFExporter'

export default function createGLTFExporter() {
  const exporter = new GLTFExporter()

  exporter.register((writer) => new LightmapExporterExtension(writer, {}))
  exporter.register((writer) => new GPUInstancingExporterExtension(writer))

  return exporter
}
