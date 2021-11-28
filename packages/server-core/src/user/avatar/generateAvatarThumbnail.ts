import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, sRGBEncoding, WebGLRenderer, Box3 } from 'three'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import {
  MAX_ALLOWED_TRIANGLES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@xrengine/common/src/constants/AvatarConstants'
import { createGLTFLoader } from '@xrengine/engine/src/assets/functions/createGLTFLoader'
import { Canvas, Image } from 'canvas'
import gl from 'gl'
// import Blob from 'cross-blob'
// ;(globalThis as any).Blob = Blob

// patch globals
import { loadDRACODecoder } from '../../../../engine/src/assets/loaders/gltf/NodeDracoLoader'
;(globalThis as any).URL = require('url')
;(globalThis as any).self = { URL }
// ;(globalThis as any).self.URL.createObjectURL = (blob) => {
//   return new Promise(resolve => {
//     blob.arrayBuffer().then(buffer => {
//       const base64 = Buffer.from(buffer).toString('base64');
//       const completedURI = `data:image/jpeg;base64,` + base64;
//       resolve(completedURI);
//     });
//   })
// };

// todo: move this out of module scope
function addEventListener(event, func, bind_) {}
// patch window prop for three
;(globalThis as any).window = { innerWidth: THUMBNAIL_WIDTH, innerHeight: THUMBNAIL_HEIGHT, addEventListener }

// patch ImageLoader
;(globalThis as any).document = {
  createElementNS: (ns, type) => {
    if (type === 'img') {
      const img = new Image() as any
      img.addEventListener = (type, handler) => {
        img['on' + type] = handler.bind(img)
      }
      img.removeEventListener = (type) => {
        img['on' + type] = null
      }
      return img
    }
  }
}

const camera = new PerspectiveCamera(45, THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT, 0.25, 20)
camera.position.set(0, 1.25, 1.25)
const scene = new Scene()
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

const canvas = new Canvas(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT) as any
canvas.addEventListener = addEventListener // mock function to avoid errors inside THREE.WebGlRenderer()
const context = gl(1, 1)
const renderer = new WebGLRenderer({
  canvas,
  context,
  antialias: true,
  preserveDrawingBuffer: true,
  alpha: true
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.outputEncoding = sRGBEncoding

const controls = getOrbitControls(camera, renderer.domElement)
controls.minDistance = 0.1
controls.maxDistance = 10
controls.target.set(0, 1.25, 0)
controls.update()

const loader = createGLTFLoader(true)
const toArrayBuffer = (buf) => {
  const arrayBuffer = new ArrayBuffer(buf.length)
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return arrayBuffer
}

export const generateAvatarThumbnail = async (avatarModel: Buffer): Promise<Buffer> => {
  await loadDRACODecoder()
  const model: any = await new Promise((resolve, reject) =>
    loader.parse(toArrayBuffer(avatarModel), '', resolve, reject)
  )
  scene.add(model.scene)
  renderer.render(scene, camera)
  scene.remove(model.scene)
  const outputBuffer = canvas.toBuffer()
  return outputBuffer
}

// const validate = (scene) => {
//   const objBoundingBox = new Box3().setFromObject(scene)
//   if (renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
//     return this.t('user:avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

//   if (renderer.info.render.triangles <= 0) return this.t('user:avatar.emptyObj')

//   const size = new THREE.Vector3().subVectors(this.maxBB, objBoundingBox.getSize(new THREE.Vector3()))
//   if (size.x <= 0 || size.y <= 0 || size.z <= 0) return this.t('user:avatar.outOfBound')

//   let bone = false
//   let skinnedMesh = false
//   scene.traverse((o) => {
//     if (o.type.toLowerCase() === 'bone') bone = true
//     if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
//   })

//   if (!bone || !skinnedMesh) return this.t('user:avatar.noBone')

//   return ''
// }
