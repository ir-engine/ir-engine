import React from 'react'
import * as THREE from 'three'
import { AccountCircle, ArrowBack, CloudUpload, SystemUpdateAlt, Help } from '@mui/icons-material'
import IconLeftClick from '../../../../common/components/Icons/IconLeftClick'
import { getLoader, loadExtentions } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { FBXLoader } from '@xrengine/engine/src/assets/loaders/fbx/FBXLoader'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { Views } from '../util'
import { withTranslation } from 'react-i18next'
import styles from '../UserMenu.module.scss'
import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  MAX_ALLOWED_TRIANGLES,
  THUMBNAIL_FILE_ALLOWED_EXTENSIONS,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@xrengine/common/src/constants/AvatarConstants'
import { TextField } from '@mui/material'
import { AuthService } from '../../../services/AuthService'

interface Props {
  changeActiveMenu: Function
  uploadAvatarModel: Function
  t: any
  isPublicAvatar?: boolean
}

interface State {
  selectedFile: any
  selectedThumbnail: any
  avatarName: string
  // imgFile: any;
  error: string
  obj: any
}

export class AvatarSelectMenu extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      selectedFile: null,
      selectedThumbnail: null,
      avatarName: '',
      // imgFile: null,
      error: '',
      obj: null
    }

    this.t = this.props.t
  }

  componentDidMount() {
    const container = document.getElementById('stage')!
    const bounds = container.getBoundingClientRect()

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

    const controls = getOrbitControls(this.camera, this.renderer.domElement)
    ;(controls as any).addEventListener('change', this.renderScene) // use if there is no animation loop
    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()

    window.addEventListener('resize', this.onWindowResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize)
  }

  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  fileSelected = false
  thumbnailSelected = false
  maxBB = new THREE.Vector3(2, 2, 2)

  t: any
  onWindowResize = () => {
    const container = document.getElementById('stage')!
    const bounds = container.getBoundingClientRect()
    this.camera.aspect = bounds.width / bounds.height
    this.camera.updateProjectionMatrix()

    this.renderer?.setSize(bounds.width, bounds.height)

    this.renderScene()
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  handleBrowse = () => {
    document.getElementById('avatarSelect')!.click()
  }

  handleThumbnail = () => {
    document.getElementById('thumbnailSelect')!.click()
  }

  handleAvatarChange = (e) => {
    if (e.target.files[0].size < MIN_AVATAR_FILE_SIZE || e.target.files[0].size > MAX_AVATAR_FILE_SIZE) {
      this.setState({
        error: this.t('user:avatar.fileOversized', {
          minSize: MIN_AVATAR_FILE_SIZE / 1048576,
          maxSize: MAX_AVATAR_FILE_SIZE / 1048576
        })
      })
      return
    }

    this.scene.children = this.scene.children.filter((c) => c.name !== 'avatar')
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (fileData) => {
      try {
        if (/\.(?:gltf|glb|vrm)/.test(file.name)) {
          const loader = getLoader()
          loader.parse(fileData.target?.result!, '', (gltf) => {
            gltf.scene.name = 'avatar'
            loadExtentions(gltf)
            this.scene.add(gltf.scene)
            this.renderScene()
            const error = this.validate(gltf.scene)
            this.setState({ error, obj: gltf.scene })
          })
        } else {
          const loader = new FBXLoader()
          const scene = loader.parse(fileData.target!.result, file.name)
          scene.name = 'avatar'
          this.scene.add(scene)
          this.renderScene()
          const error = this.validate(scene)
          this.setState({ error, obj: scene })
        }
      } catch (error) {
        console.error(error)
        this.setState({ error: this.t('user:avatar.selectValidFile') })
      }
    }

    try {
      reader.readAsArrayBuffer(file)
      this.fileSelected = true
      this.setState({ selectedFile: e.target.files[0] })
    } catch (error) {
      console.error(e)
      this.setState({ error: this.t('user:avatar.selectValidFile') })
    }
  }

  handleAvatarNameChange = (e) => {
    this.setState({ avatarName: e.target.value })
  }

  handleThumbnailChange = (e) => {
    if (e.target.files[0].size < MIN_AVATAR_FILE_SIZE || e.target.files[0].size > MAX_AVATAR_FILE_SIZE) {
      this.setState({
        error: this.t('user:avatar.fileOversized', {
          minSize: MIN_AVATAR_FILE_SIZE / 1048576,
          maxSize: MAX_AVATAR_FILE_SIZE / 1048576
        })
      })
      return
    }

    try {
      this.thumbnailSelected = true
      this.setState({ selectedThumbnail: e.target.files[0] })
    } catch (error) {
      console.error(e)
      this.setState({ error: this.t('user:avatar.selectValidThumbnail') })
    }
  }

  validate = (scene) => {
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

  openAvatarMenu = (e) => {
    e.preventDefault()
    this.props.changeActiveMenu(Views.Avatar)
  }

  uploadAvatar = () => {
    if (this.state.obj == null) return
    const error = this.validate(this.state.obj)
    if (error) {
      this.setState({ error })
      return
    }
    console.log('upload', this.state, error)

    const canvas = document.createElement('canvas')
    ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)
    const newContext = canvas.getContext('2d')
    newContext?.drawImage(this.renderer.domElement, 0, 0)

    if (this.state.selectedThumbnail == null)
      canvas.toBlob(async (blob) => {
        await AuthService.uploadAvatarModel(
          this.state.selectedFile,
          blob!,
          this.state.avatarName,
          this.props.isPublicAvatar
        )
        this.props.changeActiveMenu(Views.Profile)
      })
    else {
      AuthService.uploadAvatarModel(
        this.state.selectedFile,
        this.state.selectedThumbnail,
        this.state.avatarName,
        this.props.isPublicAvatar
      )
      this.props.changeActiveMenu(Views.Profile)
    }
  }

  render() {
    return (
      <div className={styles.avatarUploadPanel}>
        <div className={styles.avatarHeaderBlock}>
          <button type="button" className={styles.iconBlock} onClick={this.openAvatarMenu}>
            <ArrowBack />
          </button>
          <h2>{this.t('user:avatar.title')}</h2>
        </div>
        <div
          id="stage"
          className={styles.stage}
          style={{ width: THUMBNAIL_WIDTH + 'px', height: THUMBNAIL_HEIGHT + 'px' }}
        >
          <div className={styles.legendContainer}>
            <Help />
            <div className={styles.legend}>
              <div>
                <IconLeftClick /> - <span>{this.t('user:avatar.rotate')}</span>
              </div>
              <div>
                <span className={styles.shiftKey}>Shift</span> + <IconLeftClick /> -{' '}
                <span>{this.t('user:avatar.pan')}</span>
              </div>
            </div>
          </div>
        </div>
        {this.state.selectedThumbnail != null && (
          <div className={styles.thumbnailContainer}>
            <img
              src={URL.createObjectURL(this.state.selectedThumbnail)}
              alt={this.state.selectedThumbnail.name}
              className={styles.thumbnailPreview}
            />
          </div>
        )}
        <div className={styles.avatarNameContainer}>
          <TextField
            id="avatarName"
            size="small"
            name="avatarname"
            variant="outlined"
            className={styles.avatarNameInput}
            onChange={this.handleAvatarNameChange}
            placeholder="Avatar Name"
          />
        </div>
        <div className={styles.selectLabelContainer}>
          <div className={styles.avatarSelectLabel + ' ' + (this.state.error ? styles.avatarSelectError : '')}>
            {this.state.error
              ? this.state.error
              : this.fileSelected
              ? this.state.selectedFile.name
              : this.t('user:avatar.selectAvatar')}
          </div>
          <div className={styles.thumbnailSelectLabel + ' ' + (this.state.error ? styles.thumbnailSelectError : '')}>
            {this.state.error
              ? this.state.error
              : this.thumbnailSelected
              ? this.state.selectedThumbnail.name
              : this.t('user:avatar.selectThumbnail')}
          </div>
        </div>
        <input
          type="file"
          id="avatarSelect"
          accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
          hidden
          onChange={this.handleAvatarChange}
        />
        <input
          type="file"
          id="thumbnailSelect"
          accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
          hidden
          onChange={this.handleThumbnailChange}
        />
        <div className={styles.controlContainer}>
          <div className={styles.selectBtns}>
            <button type="button" className={styles.browseBtn} onClick={this.handleBrowse}>
              {this.t('user:avatar.lbl-browse')}
              <SystemUpdateAlt />
            </button>
            <button type="button" className={styles.thumbnailBtn} onClick={this.handleThumbnail}>
              {this.t('user:avatar.lbl-thumbnail')}
              <AccountCircle />
            </button>
          </div>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={this.uploadAvatar}
            disabled={!this.fileSelected || !!this.state.error}
          >
            {this.t('user:avatar.lbl-upload')}
            <CloudUpload />
          </button>
        </div>
      </div>
    )
  }
}

export default withTranslation()(AvatarSelectMenu)
