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

export enum UVOL_TYPE {
  DRACO_WITH_COMPRESSED_TEXTURE = 0,
  GLB_WITH_COMPRESSED_TEXTURE = 1,
  UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE = 2
}

export type AudioFileFormat = 'mp3' | 'wav'

export interface AudioInput {
  /**
   * Path to audio an audio file.
   */
  path: string
  /**
   * The audio encoding format.
   *
   * The following options are supported:
   * "mp3", "wav" - MP3 audio
   */
  encodeTo: AudioFileFormat[]
  /**
   * Path template to the output audio data.
   *
   * The following template substitutions are supported:
   *
   * [ext] - the file extension of the texture, (e.g., ".mp3", ".wav", etc.)
   *
   * E.g. "output/audio[ext]"
   */
  outputPath: string
}

export type GeometryFormat = 'draco' | 'glb' | 'uniform-solve'

export interface GeometryTarget {
  /**
   * Geometry encoding format.
   */
  format: GeometryFormat
  /**
   * The frame rate to encode the geometry data at.
   */
  frameRate: number
  /**
   * Total frame count. This information is supplied by the encoder.
   */
  frameCount: number

  /**
   * Priority of the geometry target.
   * Calculated by the the player.
   * Smaller targets are given smaller priority i.e., Player assumes smaller priority can be played on low-end devices
   * @default 0
   */
  priority?: number
  totalSize: number
}

export interface DracoEncodeOptions {
  /**
   * Draco compression level. [0-10], most=10, least=0, default=0.
   */
  compressionLevel?: number
  /**
   * The number of bits to quantize the position attribute. Default=11.
   */
  positionQuantizationBits?: number
  /**
   * The number of bits to quantize the texture coordinate attribute. Default=10.
   */
  textureQuantizationBits?: number
  /**
   * The number of bits to quantize the normal vector attribute. Default=8.
   */
  normalQuantizationBits?: number
  /**
   * The number of bits to quantize any generic attribute. Default=8.
   */
  genericQuantizationBits?: number
}

export interface DRACOTarget extends GeometryTarget {
  format: 'draco'
  /**
   * Draco encoding options for the geometry data.
   */
  settings: DracoEncodeOptions
  /**
   * Scale of the model.
   * This is read by the player, actual geometry data is not scaled.
   * @default {
   *  x: 1,
   *  y: 1,
   *  z: 1
   * }
   */
  scale: {
    x: number
    y: number
    z: number
  }
}

export interface GLBEncodeOptions {
  /**
   * simplify meshes targeting triangle count ratio R (default: 1; R should be between 0 and 1)
   * `simplifyAggressively` is not supported here, because sit changes the topology:
   * @link https://meshoptimizer.org/#simplification
   * @default 1
   */
  simplificationRatio?: number
}

export interface GLBTarget extends GeometryTarget {
  format: 'glb'
  /**
   * GLB encoding options for the geometry data.
   */
  settings: GLBEncodeOptions
}

export interface UniformSolveEncodeOptions {
  /**
   * simplify meshes targeting triangle count ratio R (default: 1; R should be between 0 and 1)
   * `simplifyAggressively` is not supported here, because sit changes the topology:
   * @link https://meshoptimizer.org/#simplification
   * @default 1
   */
  simplificationRatio: number
  /**
   * Segment size in seconds.
   * Implying, each segment consists `targetFrameRate` * `segmentSize` key frames. (Except the last segment, It may have less key frames.)
   */
  segmentSize: number

  /**
   * If set, normal attribute is removed from the segments.
   * When using MeshBasicMaterial, this option is recommended.
   * @default false
   */
  excludeNormals: boolean
}

export interface UniformSolveTarget extends GeometryTarget {
  format: 'uniform-solve'
  /**
   * Encoding options for the Uniform solved GLBs
   */
  settings: UniformSolveEncodeOptions
  /**
   * Number of segments
   * This info is supplied by the encoder
   */
  segmentCount?: number
  /**
   * Number of frames in the the segments
   * This info is supplied by the encoder
   */
  segmentFrameCount: number
}

export interface GeometryInput {
  /**
   * Path to geometry data. This can be a plain file path, or a file path with an index substitution pattern.
   *
   * Supported formats:
   * Alembic - should be specified as a plain file path, eg: input/geometry.abc
   * OBJ - should be specified with an index pattern, eg: input/frame_[0001-1000].obj
   * GLB - should be specified as a plain file path, eg: input/geometry.glb
   *
   * When referencing indexed files, the index should be specified as a range, eg: frame_[00001-10000].obj
   * If the first frame is 0, the index should be specified with all zeros, eg: frame_[00000-10000].obj
   * Indexed file names should be 0-padded to the same number of digits, eg: frame_00001.obj, frame_00002.obj, etc.
   */
  path: string
  /**
   * Frame rate of the geometry data. This is only required for OBJ files.
   */
  frameRate: number
  /**
   * targets
   */
  targets: Record<string, GLBTarget | DRACOTarget | UniformSolveTarget>
}

export type TextureFormat = 'ktx2' | 'astc/ktx2' | 'video'

export interface TextureTarget {
  /**
   * Texture encoding format.
   */
  format: TextureFormat
  /**
   * The frame rate to encode the geometry data at.
   */
  frameRate: number
  /**
   * Total frame count. This information is supplied by the encoder.
   */
  frameCount: number
  /**
   * Priority of the texture target.
   * Calculated by the encoder.
   * Smaller targets are given smaller priority i.e., Player assumes smaller priority can be played on low-end devices
   * @default 0
   */
  priority?: number
  totalSize: number
}

export interface KTX2EncodeOptions {
  /**
   * The compression_level parameter controls the encoder perf vs. file size tradeoff for ETC1S files
   * It does not directly control file size vs. quality - see qualityLevel
   * Range is [0, 5]
   * @default 1
   */
  compressionLevel?: number
  /**
   * Sets the ETC1S encoder's quality level, which controls the file size vs. quality tradeoff
   * Range is [1, 255]
   * @default 128
   */
  qualityLevel?: number
  /**
   * Resize images to @e width X @e height.
   * If not specified, uses the image as is.
   */
  resolution: {
    width: number
    height: number
  }

  /**
   * Vertically flip images
   */
  vflip?: boolean
}
export interface KTX2TextureTarget extends TextureTarget {
  format: 'ktx2'
  settings: KTX2EncodeOptions
}

export interface ASTCEncodeOptions {
  quality?: 'fastest' | 'fast' | 'medium' | 'thorough' | 'exhaustive'
  vflip?: boolean
  resolution: {
    width: number
    height: number
  }
}

export interface ASTCTextureTarget extends TextureTarget {
  format: 'astc/ktx2'
  settings: ASTCEncodeOptions
}

export interface TextureInput {
  /**
   * Path to texture data. This can be a plain file path, or a file path with an index substitution pattern.
   *
   * Supported formats:
   * PNG - should be specified as with an index pattern, eg: input/baseColor/frame_[00001-10000].png
   * JPEG - should be specified as with an index pattern, eg: input/baseColor/frame_[00001-10000].jpg
   *
   * When referencing indexed files, the index should be specified as a range, eg: frame_[00001-10000].png
   * If the first frame is 0, the index should be specified with all zeros, eg: frame_[00000-10000].png
   * Indexed file names should be 0-padded to the same number of digits, eg: frame_00001.png, frame_00002.png, etc.
   *
   * If the path is a single file, the frame number should be omitted, eg: baseColor.mp4
   */
  path: string
  /**
   * Frame rate of the texture data. When using indexed files, each file is assumed to be a single frame.
   */
  frameRate: number
  /**
   * targets
   */
  targets: Record<string, KTX2TextureTarget | ASTCTextureTarget>
}

export type OptionalTextureType = 'normal' | 'metallicRoughness' | 'emissive' | 'occlusion'
export type TextureType = 'baseColor' | OptionalTextureType

export interface EncoderManifest {
  audio?: AudioInput
  geometry: GeometryInput | GeometryInput[]
  /**
   * Path template to the output geometry data.
   *
   * The following template substitutions are supported:
   * [target] - one of the geometry targets, defined in the "targets" section
   * [index] - the index of the frame
   * [ext] - the file extension of the data
   *
   * E.g. "output/geometry_[target]/[index][ext]"
   */
  geometryOutputPath: string
  texture: {
    baseColor: TextureInput | TextureInput[]
    normal?: TextureInput | TextureInput[]
    metallicRoughness?: TextureInput | TextureInput[]
    emissive?: TextureInput | TextureInput[]
    occlusion?: TextureInput | TextureInput[]
  }
  /**
   * Path template to the output texture data.
   *
   * The following template substitutions are supported:
   * [target] - one of the texture targets, defined in the "targets" section
   * [index] - 0-padded index for each file with the same extension, e.g., ("000001", "000002", etc.)
   * [ext] - the file extension of the texture, (e.g., ".mp4", ".ktx2", ".astc.ktx", etc.)
   *
   * E.g. "output/texture_[target]_[type]/[index][ext]""
   */
  textureOutputPath: string
  materialProperties?: {
    normalMapType?: number
    normalScale?: [number, number]
    roughness?: number
    emissiveIntensity?: number
    aoMapIntensity?: number /* Occlusion */
  }
  /**
   * If set, the player will delete the previous buffers after the new buffers are loaded.
   * @default true
   */
  deletePreviousBuffers?: boolean
}

export interface BasePlayerManifest {
  duration: number
  audio?: {
    path: AudioInput['outputPath']
    formats: AudioFileFormat[]
    /**
     * PlayBack rate.
     * This is read by the player. Actual playbackRate data is not changed.
     * @default 1
     */
    playbackRate: number
  }
  texture: {
    baseColor: {
      targets: Record<string, TextureTarget>
      path: EncoderManifest['textureOutputPath']
    }
  } & Partial<{
    [key in OptionalTextureType]: {
      targets: Record<string, TextureTarget>
    }
  }>
  materialProperties?: {
    normalMapType?: number
    normalScale?: [number, number]
    roughness?: number
    emissiveIntensity?: number
    aoMapIntensity?: number /* Occlusion */
  }
  /**
   * If set, the player will delete the previous buffers after the new buffers are loaded.
   * @default true
   */
  deletePreviousBuffers: boolean
}

export interface DRACO_Manifest extends BasePlayerManifest {
  type: UVOL_TYPE.DRACO_WITH_COMPRESSED_TEXTURE
  geometry: {
    targets: Record<string, DRACOTarget>
    path: EncoderManifest['geometryOutputPath']
  }
}

export interface GLB_Manifest extends BasePlayerManifest {
  type: UVOL_TYPE.GLB_WITH_COMPRESSED_TEXTURE
  geometry: {
    targets: Record<string, GLBTarget>
    path: EncoderManifest['geometryOutputPath']
  }
}

export interface UniformSolve_Manifest extends BasePlayerManifest {
  type: UVOL_TYPE.UNIFORM_SOLVE_WITH_COMPRESSED_TEXTURE
  geometry: {
    targets: Record<string, UniformSolveTarget>
    path: EncoderManifest['geometryOutputPath']
  }
}

export type PlayerManifest = DRACO_Manifest | GLB_Manifest | UniformSolve_Manifest

export const ABC_TO_OBJ_PADDING = 7

export const FORMAT_TO_EXTENSION: Record<AudioFileFormat | GeometryFormat | TextureFormat, string> = {
  mp3: '.mp3',
  wav: '.wav',
  draco: '.drc',
  glb: '.glb',
  'uniform-solve': '.glb',
  ktx2: '.ktx2',
  'astc/ktx2': '.ktx2',
  video: '.mp4'
}
