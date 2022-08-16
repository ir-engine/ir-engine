import {
  CompressedTexture,
  Mesh,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  WebGLRenderer
} from 'three'

export default function createReadableTexture(
  map: CompressedTexture,
  maxDimensions?: { width: number; height: number }
): Texture {
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
  return new Texture(temporaryRenderer.domElement)
}
