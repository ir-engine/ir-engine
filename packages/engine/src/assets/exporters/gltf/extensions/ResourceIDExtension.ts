import { Mesh } from 'three'

import { ResourceID } from '../../../classes/ModelTransform'
import { GLTFExporterPlugin } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export type ResourceIDExtensionType = {
  resourceId: ResourceID
}

export default class ResourceIDExtension extends ExporterExtension implements GLTFExporterPlugin {
  constructor(writer) {
    super(writer)
    this.name = 'EE_resourceId'
  }

  writeImage(image: HTMLImageElement, imageDef: { [key: string]: any }) {
    const result: ResourceIDExtensionType = {
      resourceId: image.id as ResourceID
    }
    imageDef.extensions = imageDef.extensions ?? {}
    imageDef.extensions[this.name] = result
    this.writer.extensionsUsed[this.name] = true
  }

  writeMesh(mesh: Mesh, meshDef: { [key: string]: any }) {
    const result: ResourceIDExtensionType = {
      resourceId: mesh.geometry.uuid as ResourceID
    }
    meshDef.extensions = meshDef.extensions ?? {}
    meshDef.extensions[this.name] = result
    this.writer.extensionsUsed[this.name] = true
  }
}
