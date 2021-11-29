import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
  Box3,
  Vector3
} from 'three'
import {
  MAX_ALLOWED_TRIANGLES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@xrengine/common/src/constants/AvatarConstants'
import { createGLTFLoader } from '@xrengine/engine/src/assets/functions/createGLTFLoader'
// import { createCanvas } from 'canvas'
// import gl from '@fable/gl'
import { loadDRACODecoder } from '@xrengine/engine/src/assets/loaders/gltf/NodeDracoLoader'
// import encode from 'image-encode'

/**
 * @todo gl is problematic, we need to look into a better way to handle this
 */

let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer, loader, canvas, context

const toArrayBuffer = (buf) => {
  const arrayBuffer = new ArrayBuffer(buf.length)
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return arrayBuffer
}

const createThreeScene = () => {
  camera = new PerspectiveCamera(45, THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT, 0.1, 200)
  camera.position.set(0, 1.25, 2)
  camera.lookAt(0, 1.25, 0)
  camera.rotateZ(Math.PI)
  scene = new Scene()
  const backLight = new DirectionalLight(0xfafaff, 1)
  backLight.position.set(1, 3, -1)
  backLight.target.position.set(0, 1.5, 0)
  const frontLight = new DirectionalLight(0xfafaff, 0.7)
  frontLight.position.set(-1, 3, 1)
  frontLight.target.position.set(0, 1.5, 0)
  const hemi = new HemisphereLight(0xeeeeff, 0xebbf2c, 1)
  scene.add(backLight)
  scene.add(backLight.target)
  scene.add(frontLight)
  scene.add(frontLight.target)
  scene.add(hemi)

  //TODO
  // canvas = createCanvas(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
  canvas.addEventListener = () => {} // mock function to avoid errors inside THREE.WebGlRenderer()
  // context = gl(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { preserveDrawingBuffer: true })
  console.log(canvas, context)
  renderer = new WebGLRenderer({
    canvas,
    // context,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true
  })
  renderer.autoClear = false
  renderer.setClearColor(0xffffff, 1)
  renderer.setPixelRatio(1)
  renderer.setSize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, false)
  renderer.outputEncoding = sRGBEncoding

  loader = createGLTFLoader(true)
}

export const generateAvatarThumbnail = async (avatarModel: Buffer): Promise<Buffer> => {
  if (!renderer) createThreeScene()
  await loadDRACODecoder()
  const model: any = await new Promise((resolve, reject) =>
    loader.parse(toArrayBuffer(avatarModel), '', resolve, reject)
  )
  scene.add(model.scene)
  renderer.render(scene, camera)

  scene.remove(model.scene)
  validate(model.scene)
  const outputBuffer = canvas.toBuffer()
  // const pixels = new Uint8Array(THUMBNAIL_WIDTH * THUMBNAIL_HEIGHT * 4)
  // context.readPixels(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, context.RGBA, context.UNSIGNED_BYTE, pixels)
  // const outputBuffer = Buffer.from(encode(pixels.buffer, [THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT], 'png'))
  return outputBuffer
}

const maxBB = new Vector3(2, 2, 2)
const validate = (model) => {
  if (renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
    throw new Error(`Max allowed triangles of ${MAX_ALLOWED_TRIANGLES} surpassed, try another avatar`)

  if (renderer.info.render.triangles <= 0) throw new Error(`Avatar model seems empty, try another avatar`)

  const objBoundingBox = new Box3().setFromObject(model)
  const size = new Vector3().subVectors(maxBB, objBoundingBox.getSize(new Vector3()))
  if (size.x <= 0 || size.y <= 0 || size.z <= 0)
    throw new Error(`Avatar model seems too big or off center, check the model file`)

  let bone = false
  let skinnedMesh = false
  model.traverse((o) => {
    if (o.type.toLowerCase() === 'bone') bone = true
    if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
  })

  if (!bone || !skinnedMesh) throw new Error(`Avatar skeleton not detected, check the model files`)
}
