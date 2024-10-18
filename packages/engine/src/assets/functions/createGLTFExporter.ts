/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import BasisuExporterExtension from '../exporters/gltf/extensions/BasisuExporterExtension'
import BufferHandlerExtension from '../exporters/gltf/extensions/BufferHandlerExtension'
import { EEECSExporterExtension } from '../exporters/gltf/extensions/EEECSExporterExtension'
import EEMaterialExporterExtension from '../exporters/gltf/extensions/EEMaterialExporterExtension'
import GPUInstancingExporterExtension from '../exporters/gltf/extensions/GPUInstancingExporterExtension'
import IgnoreGeometryExporterExtension from '../exporters/gltf/extensions/IgnoreGeometryExporterExtension'
import ImageRoutingExtension from '../exporters/gltf/extensions/ImageRoutingExtension'
import ResourceIDExtension from '../exporters/gltf/extensions/ResourceIDExtension'
import SourceHandlerExtension from '../exporters/gltf/extensions/SourceHandlerExtension'
import { GLTFExporter, GLTFWriter } from '../exporters/gltf/GLTFExporter'

const extensions = [
  IgnoreGeometryExporterExtension,
  GPUInstancingExporterExtension,
  ImageRoutingExtension,
  EEMaterialExporterExtension,
  EEECSExporterExtension,
  ResourceIDExtension,
  SourceHandlerExtension
  //ImageProcessingExtension
]

export default function createGLTFExporter() {
  const exporter = new GLTFExporter()
  extensions.forEach((extension) => exporter.register((writer) => new extension(writer)))

  //create persistent instances of basisu and buffer extensions to maintain cache
  const basisUExtension = new BasisuExporterExtension(new GLTFWriter())
  exporter.register((writer) => {
    basisUExtension.writer = writer
    return basisUExtension
  })
  const bufferHandlerExtension = new BufferHandlerExtension(new GLTFWriter())
  exporter.register((writer) => {
    bufferHandlerExtension.writer = writer
    return bufferHandlerExtension
  })

  return exporter
}
