import { GLTFParser } from '../GLTFLoader'

/*
export class ResourceTracking {
     resources: Map<string, 
}*/

export class ResourceTrackingExtension {
  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }
}
