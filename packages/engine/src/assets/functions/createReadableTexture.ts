import {
  CubeTexture,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  WebGLRenderer
} from 'three'

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
  let blit: Texture = map
  if ((map as CubeTexture).isCubeTexture) {
    blit = new Texture(map.source.data[0])
  }
  const fullscreenQuadGeometry = new PlaneGeometry(2, 2, 1, 1)
  const fullscreenQuadMaterial = new ShaderMaterial({
    uniforms: { blitTexture: new Uniform(blit) },
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
  temporaryRenderer.domElement.remove()
  temporaryRenderer.dispose()
  if (!result) throw new Error('Error creating blob')
  const image = new Image(map.image.width, map.image.height)
  image.src = URL.createObjectURL(result)
  if (!options?.url) return new Texture(image)
  else return image.src
}
