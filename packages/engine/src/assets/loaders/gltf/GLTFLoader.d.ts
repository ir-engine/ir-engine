
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/


import {
  AnimationClip,
  BufferAttribute,
  BufferGeometry,
  Camera,
  ColorSpace,
  Group,
  InterleavedBufferAttribute,
  Loader,
  LoadingManager,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  SkinnedMesh,
  Texture
} from 'three'
import { Entity } from '../../../ecs/classes/Entity'

import { DRACOLoader } from './DRACOLoader'
import { KTX2Loader } from './KTX2Loader'

export interface GLTF {
  animations: AnimationClip[]
  scene: Scene
  scenes: Scene[]
  cameras: Camera[]
  asset: {
    copyright?: string | undefined
    generator?: string | undefined
    version?: string | undefined
    minVersion?: string | undefined
    extensions?: any
    extras?: any
  }
  parser: GLTFParser
  userData: any
}

export class GLTFLoader extends Loader {
  constructor(manager?: LoadingManager)
  dracoLoader: DRACOLoader | null
  ktx2Loader: KTX2Loader | null

  load(
    url: string,
    onLoad: (gltf: GLTF) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): void
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF>

  setDRACOLoader(dracoLoader: DRACOLoader): GLTFLoader

  register(callback: (parser: any) => any): GLTFLoader
  unregister(callback: (parser: any) => any): GLTFLoader

  setKTX2Loader(ktx2Loader: KTX2Loader): GLTFLoader
  setMeshoptDecoder(meshoptDecoder: /* MeshoptDecoder */ any): GLTFLoader

  parse(
    data: ArrayBuffer | string,
    path: string,
    onLoad: (gltf: GLTF) => void,
    onError?: (event: ErrorEvent) => void
  ): void
}

export interface GLTFReference {
  type: 'materials' | 'nodes' | 'textures'
  index: number
}

export class GLTFParser {
  json: any
  options: {
    path?: string
    url?: string
  }
  associations: Map<Object3D | Material | Texture, GLTFReference>

  getDependency: (type: string, index: number) => Promise<any>
  getDependencies: (type: string) => Promise<any[]>
  loadBuffer: (bufferIndex: number) => Promise<ArrayBuffer>
  loadBufferView: (bufferViewIndex: number) => Promise<ArrayBuffer>
  loadAccessor: (accessorIndex: number) => Promise<BufferAttribute | InterleavedBufferAttribute>
  loadTexture: (textureIndex: number) => Promise<Texture>
  loadTextureImage: (
    textureIndex: number,
    /**
     * GLTF.Image
     * See: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/schema/image.schema.json
     */
    source: { [key: string]: any },
    loader: Loader
  ) => Promise<Texture>
  assignTexture: (
    materialParams: { [key: string]: any },
    mapName: string,
    mapDef: {
      index: number
      texCoord?: number | undefined
      extensions?: any
    },
    colorSpace?: ColorSpace
  ) => Promise<void>
  assignFinalMaterial: (object: Mesh) => void
  getMaterialType: () => typeof MeshStandardMaterial
  loadMaterial: (materialIndex: number) => Promise<Material>
  createUniqueName: (originalName: string) => string
  createNodeMesh: (nodeIndex: number) => Promise<Group | Mesh | SkinnedMesh>
  loadGeometries: (
    /**
     * GLTF.Primitive[]
     * See: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/schema/mesh.primitive.schema.json
     */
    primitives: Array<{ [key: string]: any }>
  ) => Promise<BufferGeometry[]>
  loadMesh: (meshIndex: number) => Promise<Group | Mesh | SkinnedMesh>
  loadCamera: (cameraIndex: number) => Promise<Camera>
  loadSkin: (skinIndex: number) => Promise<{
    joints: number[]
    inverseBindMatrices?: BufferAttribute | InterleavedBufferAttribute | undefined
  }>
  loadAnimation: (animationIndex: number) => Promise<AnimationClip>
  loadNode: (nodeIndex: number) => Promise<Object3D>
  loadScene: () => Promise<Group>
}

export interface GLTFLoaderPlugin {
  beforeRoot?: (() => Promise<void> | null) | undefined
  afterRoot?: ((result: GLTF) => Promise<void> | null) | undefined
  loadMesh?: ((meshIndex: number) => Promise<Group | Mesh | SkinnedMesh> | null) | undefined
  loadBufferView?: ((bufferViewIndex: number) => Promise<ArrayBuffer> | null) | undefined
  loadMaterial?: ((materialIndex: number) => Promise<Material> | null) | undefined
  loadTexture?: ((textureIndex: number) => Promise<Texture> | null) | undefined
  getMaterialType?: ((materialIndex: number) => typeof Material | null) | undefined
  extendMaterialParams?:
    | ((materialIndex: number, materialParams: { [key: string]: any }) => Promise<any> | null)
    | undefined
  createNodeAttachment?: ((nodeIndex: number) => Promise<Object3D> | null) | undefined
}
