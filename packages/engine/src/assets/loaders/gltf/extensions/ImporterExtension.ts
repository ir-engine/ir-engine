import { GLTFParser } from '../GLTFLoader'

export class ImporterExtension {
  name: string
  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }
}
