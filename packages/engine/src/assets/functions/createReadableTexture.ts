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
    uniforms: { blitTexture: new Uniform(null) },
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
                gl_FragColor = vec4(vUv.x, -vUv.y, 0, 1);
                gl_FragColor = texture2D( blitTexture, vUv);
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

function getTemporaryRenderer(): WebGLRenderer {
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
  }
): Promise<Texture | string> {
  if (typeof map.source?.data?.src === 'string' && !/ktx2$/.test(map.source.data.src)) {
    return options?.url ? map.source.data.src : map
  }
  let blit: Texture = map.clone()
  if ((map as CubeTexture).isCubeTexture) {
    blit = new Texture(map.source.data[0])
  }
  blit.repeat = new Vector2(1, 1)
  blit.offset = new Vector2(0, 0)
  blit.rotation = 0
  const temporaryRenderer = getTemporaryRenderer()
  const temporaryScene = getTemporaryScene()
  blitMaterial.uniforms['blitTexture'].value = blit
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
  if (!options?.url) {
    const result = new Texture(image)
    result.offset = map.offset
    result.repeat = map.repeat
    result.rotation = map.rotation
    result.wrapS = map.wrapS
    result.wrapT = map.wrapT
    return result
  } else return image.src
}
