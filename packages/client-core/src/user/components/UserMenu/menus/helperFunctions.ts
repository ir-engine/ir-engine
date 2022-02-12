import { MAX_ALLOWED_TRIANGLES } from '@xrengine/common/src/constants/AvatarConstants'
import { useTranslation } from 'react-i18next'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import {
  Box3,
  Vector3,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  DirectionalLight,
  HemisphereLight,
  sRGBEncoding
} from 'three'

interface SceneProps {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
}

let scene: Scene = null!
let renderer: WebGLRenderer = null!
let camera: PerspectiveCamera = null!
export const validate = ({ vScene, renderer }) => {
  const { t } = useTranslation()
  const objBoundingBox = new Box3().setFromObject(vScene)
  let maxBB = new Vector3(2, 2, 2)

  if (renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
    return t('user:avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

  if (renderer.info.render.triangles <= 0) return t('user:avatar.emptyObj')

  const size = new Vector3().subVectors(maxBB, objBoundingBox.getSize(new Vector3()))
  if (size.x <= 0 || size.y <= 0 || size.z <= 0) return t('user:avatar.outOfBound')

  let bone = false
  let skinnedMesh = false
  vScene.traverse((o) => {
    if (o.type.toLowerCase() === 'bone') bone = true
    if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
  })

  if (!bone || !skinnedMesh) return t('user:avatar.noBone')

  return ''
}

export const initializer = () => {
  const container = document.getElementById('stage')!
  const bounds = container.getBoundingClientRect()

  camera = new PerspectiveCamera(45, bounds.width / bounds.height, 0.25, 20)
  camera.position.set(0, 1.25, 1.25)

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
  renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(bounds.width, bounds.height)
  renderer.outputEncoding = sRGBEncoding
  renderer.domElement.id = 'avatarCanvas'
  container.appendChild(renderer.domElement)

  return {
    scene,
    camera,
    renderer
  }
}

export const onWindowResize = (props: SceneProps) => {
  const container = document.getElementById('stage')
  const bounds = container?.getBoundingClientRect()!
  props.camera.aspect = bounds.width / bounds.height
  props.camera.updateProjectionMatrix()

  props.renderer.setSize(bounds.width, bounds.height)

  renderScene(props)
}

export const renderScene = (props: SceneProps) => {
  props.renderer.render(props.scene, props.camera)
}
