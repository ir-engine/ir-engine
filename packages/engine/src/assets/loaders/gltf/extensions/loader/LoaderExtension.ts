import { GLTFParser } from '../../GLTFLoader'

export class LoaderExtension {
  loader: any
  parser: GLTFParser
  options: any
  extensionNames: any[]
  constructor(loader, options) {
    this.loader = loader
    this.options = options
    this.extensionNames = []
  }
  onLoad() {}
}
