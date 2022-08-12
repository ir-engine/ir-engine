import { KTX2Encoder } from '@etherealjs/web-layer/core/textures/KTX2Encoder'
import {
  CompressedTexture,
  DataTexture,
  Mesh,
  PerspectiveCamera,
  PixelFormat,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

import { EngineRenderer } from '../../../../renderer/WebGLRendererSystem'
import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class BasisuExporterExtension extends ExporterExtension {
  constructor(writer: GLTFWriter) {
    super(writer, {})
    this.name = 'KHR_texture_basisu'
    this.sampler = writer.processSampler(new Texture())
    this.imgCache = new Map<any, number>()
  }

  imgCache: Map<any, number>
  sampler: any

  buildReadableTexture(map: CompressedTexture): Texture {
    const fullscreenQuadGeometry = new PlaneBufferGeometry(2, 2, 1, 1)
    const fullscreenQuadMaterial = new ShaderMaterial({
      uniforms: { blitTexture: new Uniform(map) },
      vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position = vec4(position.xy * 1.0,0.,.999999);
            }`,
      fragmentShader: `
            uniform sampler2D blitTexture; 
            varying vec2 vUv;
            void main(){ 
                gl_FragColor = vec4(vUv.xy, 0, 1);
                gl_FragColor = texture2D( blitTexture, vUv);
            }`
    })

    const fullscreenQuad = new Mesh(fullscreenQuadGeometry, fullscreenQuadMaterial)
    fullscreenQuad.frustumCulled = false

    const temporaryCam = new PerspectiveCamera()
    const temporaryScene = new Scene()
    temporaryScene.add(fullscreenQuad)

    const temporaryRenderer = new WebGLRenderer({ antialias: false })
    temporaryRenderer.setSize(map.image.width, map.image.height)
    temporaryRenderer.clear()
    temporaryRenderer.render(temporaryScene, temporaryCam)
    //const imgData = temporaryRenderer.domElement.getContext("2d")!.createImageData(map.image.width, map.image.height)
    //const imgData = temporaryRenderer.domElement.getContext("webgl2")?.
    //if (!imgData) throw new Error("Failed to create image data for texture: " + map)
    return new Texture(temporaryRenderer.domElement)
  }

  writeTexture(_texture: CompressedTexture, textureDef) {
    if (!_texture.isCompressedTexture) return
    const writer = this.writer
    const texture = this.buildReadableTexture(_texture)
    textureDef.source = writer.processImage(texture.image, texture.format, texture.flipY)
    textureDef.sampler = this.sampler
    /*const image: HTMLCanvasElement = texture.image
    const ktx2write = new KTX2Encoder()
    const imageDef: any = {
      width: image.width,
      height: image.height,
      mimeType: 'image/ktx2'
    }
    if (!writer.json.images) writer.json.images = []
    const index = writer.json.images.push(imageDef) - 1
    writer.pending.push(
      new Promise((resolve) => {
        ktx2write.encode(imgData as any).then((arrayBuf) => {
          const blob = new Blob([arrayBuf])
          writer
            .processBufferViewImage(blob)
            .then((source) => {
              imageDef.bufferView = source
              writer.extensionsUsed[this.name] = true
              textureDef.extensions = textureDef.extensions ?? {}
              textureDef.extensions[this.name] = { source: index }
              textureDef.sampler = this.sampler
            })
            .then(resolve)
        })
      })
    )*/
  }
}
