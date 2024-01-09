import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class ImageRoutingExtension extends ExporterExtension implements GLTFExporterPlugin {
  originalSrc: string

  constructor(writer: GLTFWriter) {
    super(writer)
  }
}
