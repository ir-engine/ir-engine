import { Mesh, Texture } from 'three'

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

  writeTexture(map: Texture, textureDef: { [key: string]: any }) {
    const result: ResourceIDExtensionType = {
      resourceId: map.image.id as ResourceID
    }
    textureDef.extensions = textureDef.extensions ?? {}
    textureDef.extensions[this.name] = result
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
