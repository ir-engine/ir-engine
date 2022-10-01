import {
  Camera,
  CubeTexture,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector2,
  Vector4,
  WebGLRenderer,
  Wrapping
} from 'three'

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

export default async function createReadableTexture(
  map: Texture,
  options?: {
    maxDimensions?: { width: number; height: number }
    url?: boolean
    keepTransform?: boolean
    flipX?: boolean
    flipY?: boolean
  }
): Promise<Texture | string> {
  if (typeof map.source?.data?.src === 'string' && !/ktx2$/.test(map.source.data.src)) {
    return options?.url ? map.source.data.src : map
  }
  let blit: Texture = map.clone()
  if ((map as CubeTexture).isCubeTexture) {
    blit = new Texture(map.source.data[0])
  }
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
  const result = await new Promise<Blob | null>((resolve) =>
    temporaryRenderer.domElement.getContext('webgl2')!.canvas.toBlob(resolve)
  )
  //temporaryRenderer.domElement.remove()
  //temporaryRenderer.dispose()
  if (!result) throw new Error('Error creating blob')
  const image = new Image(map.image.width, map.image.height)
  image.src = URL.createObjectURL(result)
  await new Promise<void>(async (resolve) => {
    image.onload = () => resolve()
  })
  if (!options?.url) {
    const finalTexture = new Texture(image)
    if (!options?.keepTransform) {
      finalTexture.offset = map.offset
      finalTexture.repeat = map.repeat
      finalTexture.rotation = map.rotation
    }
    finalTexture.wrapS = map.wrapS
    finalTexture.wrapT = map.wrapT
    return finalTexture
  } else return image.src
}
