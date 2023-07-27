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
  Camera,
  CubeTexture,
  LinearSRGBColorSpace,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

export type BlitTextureOptions = {
  maxDimensions?: { width: number; height: number }
  keepTransform?: boolean
  flipX?: boolean
  flipY?: boolean
}

function initializeTemporaryRenderer() {
  return new WebGLRenderer({ antialias: false })
}

let blitMaterial: ShaderMaterial
let temporaryCam: Camera

function initializeTemporaryScene() {
  const fullscreenQuadGeometry = new PlaneGeometry(2, 2, 1, 1)
  blitMaterial = new ShaderMaterial({
    uniforms: {
      blitTexture: new Uniform(null),
      flipX: new Uniform(false),
      flipY: new Uniform(false),
      scaleOffset: new Uniform(new Vector4(1, 1, 0, 0))
    },
    vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position = vec4(position.xy * 1.0,0.,.999999);
            }`,
    fragmentShader: `
            uniform sampler2D blitTexture; 
            uniform bool flipX;
            uniform bool flipY;
            uniform vec4 scaleOffset;
            varying vec2 vUv;
            void main(){ 
                vec2 uv = vUv * scaleOffset.xy + scaleOffset.zw;
                if (flipX) uv.x *= -1.;
                if (flipY) uv.y *= -1.;
                gl_FragColor = texture2D( blitTexture, uv );
            }`
  })

  const fullscreenQuad = new Mesh(fullscreenQuadGeometry, blitMaterial)
  fullscreenQuad.frustumCulled = false

  temporaryCam = new PerspectiveCamera()
  const temporaryScene = new Scene()
  temporaryScene.add(fullscreenQuad)
  return temporaryScene
}

let _temporaryRenderer: WebGLRenderer | undefined
let _temporaryRenderTarget: WebGLRenderTarget | undefined
let _temporaryScene: Scene | undefined

export function getTemporaryRenderer(): WebGLRenderer {
  if (!_temporaryRenderer) {
    _temporaryRenderer = initializeTemporaryRenderer()
  }
  return _temporaryRenderer!
}

function getTemporaryScene(): Scene {
  if (!_temporaryScene) {
    _temporaryScene = initializeTemporaryScene()
  }
  return _temporaryScene
}

export function getTemporaryRenderTarget(width, height): WebGLRenderTarget {
  if (!_temporaryRenderTarget) {
    _temporaryRenderTarget = new WebGLRenderTarget(width, height)
  }
  _temporaryRenderTarget.setSize(width, height)
  return _temporaryRenderTarget
}

function blitTexture(map: Texture, options?: BlitTextureOptions | undefined) {
  let blit: Texture = map.clone()
  if ((map as CubeTexture).isCubeTexture) {
    blit = new Texture(map.source.data[0])
  }
  map.colorSpace = LinearSRGBColorSpace
  const temporaryRenderer = getTemporaryRenderer()
  const temporaryScene = getTemporaryScene()
  if (options?.keepTransform) {
    blitMaterial.uniforms['scaleOffset'].value = new Vector4(
      blit.repeat.x,
      -blit.repeat.y,
      blit.offset.x,
      1 - blit.offset.y
    )
  } else {
    blitMaterial.uniforms['scaleOffset'].value = new Vector4(1, 1, 0, 0)
  }
  blitMaterial.uniforms['blitTexture'].value = blit
  blitMaterial.uniforms['flipX'].value = options?.flipX ?? false
  blitMaterial.uniforms['flipY'].value = options?.flipY ?? false
  blitMaterial.uniformsNeedUpdate = true
  const maxDimensions = options?.maxDimensions
  if (maxDimensions) {
    temporaryRenderer.setSize(
      Math.min(map.image.width, maxDimensions.width),
      Math.min(map.image.height, maxDimensions.height)
    )
  } else {
    temporaryRenderer.setSize(map.image.width, map.image.height)
  }
  temporaryRenderer.clear()
  temporaryRenderer.render(temporaryScene, temporaryCam)
  if (blit !== map) {
    blit.dispose()
  }
}

export function renderTargetFromTexture(map: Texture, options?: BlitTextureOptions | undefined): WebGLRenderTarget {
  const renderTarget = getTemporaryRenderTarget(map.image.width, map.image.height).clone()
  const renderer = getTemporaryRenderer()
  renderer.setRenderTarget(renderTarget)
  blitTexture(map, options)
  renderer.setRenderTarget(null)
  return renderTarget
}

export default async function createReadableTexture(
  map: Texture,
  options?: {
    url?: boolean
    canvas?: boolean
  } & BlitTextureOptions
): Promise<Texture | string> {
  if (typeof map.source?.data?.src === 'string' && !/ktx2$/.test(map.source.data.src)) {
    return options?.url ? map.source.data.src : map
  }
  const temporaryRenderer = getTemporaryRenderer()
  blitTexture(map, options)
  const result = await new Promise<Blob | null>((resolve) =>
    (temporaryRenderer.domElement.getContext('webgl2')!.canvas as HTMLCanvasElement).toBlob(resolve)
  )

  if (!result) throw new Error('Error creating blob')
  const image = new Image(map.image.width, map.image.height)
  image.src = URL.createObjectURL(result)
  await new Promise<void>((resolve) => {
    image.onload = () => resolve()
  })
  let finalTexture: Texture
  if (options?.url) return image.src
  if (options?.canvas) {
    const canvas = document.createElement('canvas')
    canvas.width = map.image.width
    canvas.height = map.image.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    finalTexture = new Texture(canvas)
  } else {
    finalTexture = new Texture(image)
  }
  if (!options?.keepTransform) {
    finalTexture.offset = map.offset
    finalTexture.repeat = map.repeat
    finalTexture.rotation = map.rotation
  }
  finalTexture.wrapS = map.wrapS
  finalTexture.wrapT = map.wrapT
  finalTexture.colorSpace = map.colorSpace
  return finalTexture
}
