import { GLTFWriter } from '../GLTFExporter'

export class ExporterExtension {
  name: string
  writer: GLTFWriter
  options: any
  constructor(exporter, options) {
    this.writer = exporter
    this.options = options
  }
}
