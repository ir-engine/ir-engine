import { Object3D } from 'three'

import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class EEColliderExporterExtension extends ExporterExtension {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'EE_collider'
  }

  writeNode(node: Object3D, nodeDef) {
    if (!node?.isObject3D) return
    const writer = this.writer
    nodeDef.extensions = nodeDef.extensions ?? {}
    const extensionDef = {}
    nodeDef[this.name] = extensionDef
  }
}
