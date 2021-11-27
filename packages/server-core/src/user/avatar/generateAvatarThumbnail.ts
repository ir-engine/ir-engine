import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, sRGBEncoding, WebGLRenderer } from 'three'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@xrengine/common/src/constants/AvatarConstants'
import { createGLTFLoader } from '@xrengine/engine/src/assets/functions/createGLTFLoader'
import { Canvas } from 'canvas'
import gl from 'gl'

// todo: move this out of module scope
function addEventListener(event, func, bind_) {}
// patch window prop for three
;(globalThis as any).window = { innerWidth: THUMBNAIL_WIDTH, innerHeight: THUMBNAIL_HEIGHT, addEventListener }

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

export const generateAvatarThumbnail = async (avatarModel: Buffer) => {}

/*
const validate = (scene) => {
  const objBoundingBox = new THREE.Box3().setFromObject(scene)
  if (this.renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
    return this.t('user:avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

  if (this.renderer.info.render.triangles <= 0) return this.t('user:avatar.emptyObj')

  const size = new THREE.Vector3().subVectors(this.maxBB, objBoundingBox.getSize(new THREE.Vector3()))
  if (size.x <= 0 || size.y <= 0 || size.z <= 0) return this.t('user:avatar.outOfBound')

  let bone = false
  let skinnedMesh = false
  scene.traverse((o) => {
    if (o.type.toLowerCase() === 'bone') bone = true
    if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
  })

  if (!bone || !skinnedMesh) return this.t('user:avatar.noBone')

  return ''
}

const uploadAvatar = () => {
  if (this.state.obj == null) return
  const error = this.validate(this.state.obj)
  if (error) {
    this.setState({ error })
    return
  }

  const canvas = document.createElement('canvas')
  ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)
  const newContext = canvas.getContext('2d')
  newContext?.drawImage(this.renderer.domElement, 0, 0)

  if (this.state.selectedThumbnail == null)
    canvas.toBlob(async (blob) => {
      await this.props.uploadAvatarModel(
        this.state.selectedFile,
        blob,
        this.state.avatarName,
        this.props.isPublicAvatar
      )
      this.props.changeActiveMenu(Views.Profile)
    })
  else {
    this.props.uploadAvatarModel(
      this.state.selectedFile,
      this.state.avatarName,
      this.props.isPublicAvatar
    )
    this.props.changeActiveMenu(Views.Profile)
  }
}*/
