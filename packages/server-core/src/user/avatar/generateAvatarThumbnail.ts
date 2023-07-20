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
  Box3,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer
} from 'three'

import {
  MAX_ALLOWED_TRIANGLES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@etherealengine/common/src/constants/AvatarConstants'
import { createGLTFLoader } from '@etherealengine/engine/src/assets/functions/createGLTFLoader'
import { loadDRACODecoderNode } from '@etherealengine/engine/src/assets/loaders/gltf/NodeDracoLoader'

import logger from '../../ServerLogger'

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
  logger.info({ canvas, context })
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
  renderer.outputColorSpace = SRGBColorSpace

  loader = createGLTFLoader(true)
}

export const generateAvatarThumbnail = async (avatarModel: Buffer): Promise<Buffer> => {
  if (!renderer) createThreeScene()
  await loadDRACODecoderNode()
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
