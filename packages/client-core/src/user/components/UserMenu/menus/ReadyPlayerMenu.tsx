import CircularProgress from '@mui/material/CircularProgress'
import { ArrowBack } from '@mui/icons-material'
import {
  MAX_ALLOWED_TRIANGLES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@xrengine/common/src/constants/AvatarConstants'
import { getLoader, loadExtentions } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import React from 'react'
import { withTranslation } from 'react-i18next'
import * as THREE from 'three'
import styles from '../UserMenu.module.scss'
import { Views } from '../util'
import { AuthService } from '../../../services/AuthService'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

interface State {
  selectedFile: any
  avatarName: string
  avatarUrl: string
  error: string
  obj: any
}

interface Props {
  changeActiveMenu: Function
  uploadAvatarModel: Function
  t: any
  isPublicAvatar?: boolean
}

export class ReadyPlayerMenu extends React.Component<Props, State> {
  t: any
  scene: Scene = null!
  renderer: WebGLRenderer = null!
  maxBB = new THREE.Vector3(2, 2, 2)
  camera: PerspectiveCamera = null!
  controls: OrbitControls = null!

  constructor(props) {
    super(props)

    this.state = {
      selectedFile: null,
      avatarName: null!,
      avatarUrl: '',
      error: '',
      obj: null
    }

    this.t = this.props.t
  }

  componentDidMount() {
    const container = document.getElementById('stage')!
    const bounds = container?.getBoundingClientRect()!

    this.camera = new THREE.PerspectiveCamera(45, bounds.width / bounds.height, 0.25, 20)
    this.camera.position.set(0, 1.25, 1.25)

    this.scene = new THREE.Scene()

    const backLight = new THREE.DirectionalLight(0xfafaff, 1)
    backLight.position.set(1, 3, -1)
    backLight.target.position.set(0, 1.5, 0)
    const frontLight = new THREE.DirectionalLight(0xfafaff, 0.7)
    frontLight.position.set(-1, 3, 1)
    frontLight.target.position.set(0, 1.5, 0)
    const hemi = new THREE.HemisphereLight(0xeeeeff, 0xebbf2c, 1)
    this.scene.add(backLight)
    this.scene.add(backLight.target)
    this.scene.add(frontLight)
    this.scene.add(frontLight.target)
    this.scene.add(hemi)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(bounds.width, bounds.height)
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.domElement.id = 'avatarCanvas'
    container.appendChild(this.renderer.domElement)

    this.controls = getOrbitControls(this.camera, this.renderer.domElement)
    ;(this.controls as any).addEventListener('change', this.renderScene) // use if there is no animation loop
    this.controls.minDistance = 0.1
    this.controls.maxDistance = 10
    this.controls.target.set(0, 1.25, 0)
    this.controls.update()

    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('message', this.handleMessageEvent)
  }

  componentWillUnmount() {
    ;(this.controls as any).removeEventListener('change', this.renderScene)
    window.removeEventListener('resize', this.onWindowResize)
    window.removeEventListener('message', this.handleMessageEvent)
  }

  onWindowResize = () => {
    const container = document.getElementById('stage')
    const bounds = container?.getBoundingClientRect()!
    this.camera.aspect = bounds.width / bounds.height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(bounds.width, bounds.height)

    this.renderScene()
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  handleMessageEvent = async (event) => {
    const url = event.data
    if (url != null && url.toString().toLowerCase().startsWith('http')) {
      this.setState({
        avatarUrl: url
      })

      try {
        const loader = getLoader()

        var avatarResult = await new Promise((resolve, reject) => {
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw Error(response.statusText)
              }
              return response
            })
            .then((response) => response.blob())
            .then((blob) => resolve(blob))
            .catch((error) => {
              reject(error)
            })
        })

        var avatarArrayBuffer = await new Response(avatarResult as any).arrayBuffer()
        loader.parse(avatarArrayBuffer, '', (gltf) => {
          var avatarName = this.state.avatarUrl.substring(
            this.state.avatarUrl.lastIndexOf('/') + 1,
            this.state.avatarUrl.length
          )
          gltf.scene.name = 'avatar'
          loadExtentions(gltf)
          this.scene.add(gltf.scene)
          this.renderScene()
          const error = this.validate(gltf.scene)
          this.setState({ error, obj: gltf.scene, selectedFile: new File([avatarResult as any], avatarName) })

          this.uploadAvatar()
        })
      } catch (error) {
        console.error(error)
        this.setState({ error: this.t('user:usermenu.avatar.selectValidFile') })
      }
    }
  }

  openProfileMenu = (e) => {
    e.preventDefault()
    this.props.changeActiveMenu(Views.Profile)
  }

  closeMenu = (e) => {
    e.preventDefault()
    this.props.changeActiveMenu(null)
  }

  validate = (scene) => {
    const objBoundingBox = new THREE.Box3().setFromObject(scene)
    if (this.renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
      return this.t('user:usermenu.avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

    if (this.renderer.info.render.triangles <= 0) return this.t('user:usermenu.avatar.emptyObj')

    const size = new THREE.Vector3().subVectors(this.maxBB, objBoundingBox.getSize(new THREE.Vector3()))
    if (size.x <= 0 || size.y <= 0 || size.z <= 0) return this.t('user:usermenu.avatar.outOfBound')

    let bone = false
    let skinnedMesh = false
    scene.traverse((o) => {
      if (o.type.toLowerCase() === 'bone') bone = true
      if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
    })

    if (!bone || !skinnedMesh) return this.t('user:usermenu.avatar.noBone')

    return ''
  }

  uploadAvatar = () => {
    const error = this.validate(this.state.obj)
    if (error) {
      return
    }

    const canvas = document.createElement('canvas')
    ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(this.renderer.domElement, THUMBNAIL_WIDTH / 2 - THUMBNAIL_WIDTH, 0)

    var thumbnailName = this.state.avatarUrl.substring(0, this.state.avatarUrl.lastIndexOf('.')) + '.png'

    canvas.toBlob(async (blob) => {
      await AuthService.uploadAvatarModel(
        this.state.selectedFile,
        new File([blob!], thumbnailName),
        this.state.avatarName,
        this.props.isPublicAvatar
      )
      this.props.changeActiveMenu(Views.Profile)
    })
  }

  render() {
    return (
      <div className={styles.ReadyPlayerPanel}>
        <div
          id="stage"
          className={styles.stage}
          style={{
            width: THUMBNAIL_WIDTH + 'px',
            height: THUMBNAIL_HEIGHT + 'px',
            position: 'absolute',
            top: '0',
            right: '100%'
          }}
        ></div>
        {this.state.avatarUrl === '' ? (
          <iframe src={`https://${globalThis.process.env['VITE_READY_PLAYER_ME_URL']}`} />
        ) : (
          <div className={styles.centerProgress}>
            <CircularProgress />
          </div>
        )}
        <section className={styles.controlContainer}>
          <div className={styles.actionBlock}>
            <button type="button" className={styles.iconBlock} onClick={this.openProfileMenu}>
              <ArrowBack />
            </button>
            {/*<button type="button" className={styles.iconBlock} onClick={closeMenu}>
            <Check />
          </button>*/}
          </div>
        </section>
      </div>
    )
  }
}

export default withTranslation()(ReadyPlayerMenu)
