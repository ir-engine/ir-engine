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

import { resolveAsync } from 'expo-asset-utils'
import { Image, Platform } from 'react-native'
import { GPUOffscreenCanvas } from 'react-native-wgpu'
import THREE, { DataTexture, LoadingManager, Texture } from 'three'
import { Loader } from '../base/Loader'

const iOSMaxResolution = 1024

export class TextureLoader extends Loader<Texture> {
  maxResolution: number | undefined
  autoDetectBitmap: boolean | undefined

  constructor(manager?: LoadingManager, autoDetectBitmap?: boolean, maxResolution?: number) {
    super(manager)
    if (maxResolution) this.maxResolution = maxResolution
    else if (Platform.OS === 'ios') this.maxResolution = iOSMaxResolution
    this.autoDetectBitmap = autoDetectBitmap
  }

  override async load(
    asset: any,
    onLoad?: (texture: THREE.Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: unknown) => void
  ) {
    if (!asset) {
      throw new Error('ExpoTHREE.TextureLoader.load(): Cannot parse a null asset')
    }

    const nativeAsset = await resolveAsync(asset)

    if (!nativeAsset.width || !nativeAsset.height) {
      const { width, height } = await new Promise<{
        width: number
        height: number
      }>((res, rej) => {
        Image.getSize(nativeAsset.localUri!, (width: number, height: number) => res({ width, height }), rej)
      })
      nativeAsset.width = width
      nativeAsset.height = height
    }

    if (this.maxResolution && calculateResizingFactor(this.maxResolution, nativeAsset.height, nativeAsset.width) < 1) {
      const data = await getScaledTextureData(nativeAsset.localUri!, this.maxResolution)

      try {
        // TODO: why is the texture the wrong color?
        const texture = new DataTexture(new Uint8Array(data.data), data.width, data.height)
        texture.needsUpdate = true
        console.log('success', texture.id)

        onLoad?.(texture)
      } catch (err) {
        console.error(err)
        onError?.(err)
      }
    } else {
      const texture = new THREE.Texture()
      texture['isDataTexture'] = true // Forces passing to `gl.texImage2D(...)` verbatim
      texture.image = {
        data: nativeAsset,
        width: nativeAsset.width,
        height: nativeAsset.height
      }
      texture.needsUpdate = true

      if (onLoad !== undefined) {
        onLoad(texture)
      }
    }
  }
}

const calculateResizingFactor = (maxResolution: number, originalHeight: number, originalWidth: number) => {
  let resizingFactor = 1
  if (originalWidth >= originalHeight) {
    if (originalWidth > maxResolution) {
      resizingFactor = maxResolution / originalWidth
    }
  } else {
    if (originalHeight > maxResolution) {
      resizingFactor = maxResolution / originalHeight
    }
  }
  return resizingFactor
}

async function createTextureFromBase64(device: GPUDevice, imageURI: string) {
  const response = await fetch(imageURI)
  const blob = await response.blob()

  // Create ImageBitmap
  const imageBitmap = await createImageBitmap(blob)

  // Create texture
  const texture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height, 1],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
  })

  device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: texture }, [
    imageBitmap.width,
    imageBitmap.height
  ])

  return texture
}

const getScaledTextureData = async (imageURI: string, maxResolution: number) => {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    throw new Error('No adapter')
  }
  const device = await adapter.requestDevice()

  const canvas = new GPUOffscreenCanvas(maxResolution, maxResolution)
  const context = canvas.getContext('webgpu')
  if (!context) {
    throw new Error('Could not get webgpu context')
  }

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
  console.log(presentationFormat)
  context?.configure({
    device: device!,
    format: presentationFormat,
    alphaMode: 'premultiplied'
  })

  const vertices = new Float32Array([
    // positions    // texture coordinates
    -1.0,
    -1.0,
    0.0,
    1.0, // bottom left
    1.0,
    -1.0,
    1.0,
    1.0, // bottom right
    -1.0,
    1.0,
    0.0,
    0.0, // top left
    1.0,
    1.0,
    1.0,
    0.0 // top right
  ])

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  })
  new Float32Array(vertexBuffer.getMappedRange()).set(vertices)
  vertexBuffer.unmap()

  // Load and create texture from base64

  // Create sampler
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    mipmapFilter: 'linear'
  })

  // Create shader module
  const shaderModule = device.createShaderModule({
    code: `
struct VertexInput {
@location(0) position: vec2<f32>,
@location(1) texCoord: vec2<f32>,
};

struct VertexOutput {
@builtin(position) position: vec4<f32>,
@location(0) texCoord: vec2<f32>,
};

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
var output: VertexOutput;
output.position = vec4<f32>(input.position, 0.0, 1.0);
output.texCoord = input.texCoord;
return output;
}

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var tex: texture_2d<f32>;

@fragment
fn fragmentMain(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
let color = textureSample(tex, texSampler, texCoord);
// Native texture uses bgra format, swap blue and red values for correct output.
return vec4f(color.b, color.g, color.r, color.a);
}
`
  })

  const texture = await createTextureFromBase64(device, imageURI)

  // Create bind group layout
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: { type: 'filtering' }
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: 'float' }
      }
    ]
  })

  // Create pipeline layout
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout]
  })

  // Create bind group
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: sampler
      },
      {
        binding: 1,
        resource: texture.createView()
      }
    ]
  })

  // Create render pipeline
  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: 16, // 4 floats * 4 bytes
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2'
            },
            {
              shaderLocation: 1,
              offset: 8,
              format: 'float32x2'
            }
          ]
        }
      ]
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragmentMain',
      targets: [
        {
          format: presentationFormat
        }
      ]
    },
    primitive: {
      topology: 'triangle-strip',
      stripIndexFormat: 'uint32'
    }
  })

  // Create command encoder and begin render pass
  const commandEncoder = device.createCommandEncoder()
  const textureView = context.getCurrentTexture().createView()

  const renderPassDescriptor = {
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store'
      }
    ]
  }

  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
  passEncoder.setPipeline(pipeline)
  passEncoder.setBindGroup(0, bindGroup)
  passEncoder.setVertexBuffer(0, vertexBuffer)
  passEncoder.draw(4, 1, 0, 0)
  passEncoder.end()

  // Submit commands to GPU
  device.queue.submit([commandEncoder.finish()])

  const data = await canvas.getImageData()
  return data
}
