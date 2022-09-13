import { GLTFWriter } from '../GLTFExporter'

export class ExporterExtension {
  name: string
  writer: GLTFWriter
  constructor(exporter) {
    this.writer = exporter
  }
}
