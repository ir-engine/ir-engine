export class ExporterExtension {
  exporter: any
  options: any
  constructor(exporter, options) {
    this.exporter = exporter
    this.options = options
  }
  onRegister() {}
}
