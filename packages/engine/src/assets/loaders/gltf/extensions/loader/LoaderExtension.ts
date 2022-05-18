export class LoaderExtension {
  loader: any
  options: any
  extensionNames: any[]
  constructor(loader, options) {
    this.loader = loader
    this.options = options
    this.extensionNames = []
  }
  onLoad() {}
}
