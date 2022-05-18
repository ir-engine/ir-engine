import { AccountCircle, ArrowBack, CloudUpload, Help, SystemUpdateAlt } from '@mui/icons-material'
import TextField from '@mui/material/TextField'
import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_ALLOWED_TRIANGLES,
  MAX_AVATAR_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  THUMBNAIL_FILE_ALLOWED_EXTENSIONS,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@xrengine/common/src/constants/AvatarConstants'
import { getLoader, loadExtensions } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { FBXLoader } from '@xrengine/engine/src/assets/loaders/fbx/FBXLoader'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import IconLeftClick from '../../../../common/components/Icons/IconLeftClick'
import { AuthService } from '../../../services/AuthService'
import styles from '../UserMenu.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
  uploadAvatarModel?: Function
  isPublicAvatar?: boolean
}

export const AvatarSelectMenu = (props: Props) => {
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null)
  const [avatarName, setAvatarName] = useState('')
  const [error, setError] = useState('')
  const [obj, setObj] = useState<any>(null)

  const { isPublicAvatar, changeActiveMenu, uploadAvatarModel } = props

  let camera: THREE.PerspectiveCamera
  let scene: THREE.Scene
  let renderer: THREE.WebGLRenderer
  let fileSelected = false
  let thumbnailSelected = false
  let maxBB = new THREE.Vector3(2, 2, 2)

  const { t } = useTranslation()

  const renderScene = () => {
    renderer.render(scene, camera)
  }

  const onWindowResize = () => {
    const container = document.getElementById('stage')!
    const bounds = container.getBoundingClientRect()
    camera.aspect = bounds.width / bounds.height
    camera.updateProjectionMatrix()

    renderer?.setSize(bounds.width, bounds.height)

    renderScene()
  }

  useEffect(() => {
    const container = document.getElementById('stage')!
    const bounds = container.getBoundingClientRect()

    camera = new THREE.PerspectiveCamera(45, bounds.width / bounds.height, 0.25, 20)
    camera.position.set(0, 1.25, 1.25)

    scene = new THREE.Scene()

    const backLight = new THREE.DirectionalLight(0xfafaff, 1)
    backLight.position.set(1, 3, -1)
    backLight.target.position.set(0, 1.5, 0)
    const frontLight = new THREE.DirectionalLight(0xfafaff, 0.7)
    frontLight.position.set(-1, 3, 1)
    frontLight.target.position.set(0, 1.5, 0)
    const hemi = new THREE.HemisphereLight(0xeeeeff, 0xebbf2c, 1)
    scene.add(backLight)
    scene.add(backLight.target)
    scene.add(frontLight)
    scene.add(frontLight.target)
    scene.add(hemi)

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(bounds.width, bounds.height)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.domElement.id = 'avatarCanvas'
    container.appendChild(renderer.domElement)

    const controls = getOrbitControls(camera, renderer.domElement)
    ;(controls as any).addEventListener('change', renderScene) // use if there is no animation loop
    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()

    window.addEventListener('resize', onWindowResize)

    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  const handleBrowse = () => {
    document.getElementById('avatarSelect')!.click()
  }

  const handleThumbnail = () => {
    document.getElementById('thumbnailSelect')!.click()
  }

  const handleAvatarChange = (e) => {
    if (e.target.files[0].size < MIN_AVATAR_FILE_SIZE || e.target.files[0].size > MAX_AVATAR_FILE_SIZE) {
      setError(
        t('user:avatar.fileOversized', {
          minSize: MIN_AVATAR_FILE_SIZE / 1048576,
          maxSize: MAX_AVATAR_FILE_SIZE / 1048576
        })
      )
      return
    }

    scene.children = scene.children.filter((c) => c.name !== 'avatar')
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (fileData) => {
      try {
        if (/\.(?:gltf|glb|vrm)/.test(file.name)) {
          const loader = getLoader()
          loader.parse(fileData.target?.result!, '', (gltf) => {
            gltf.scene.name = 'avatar'
            loadExtensions(gltf)
            scene.add(gltf.scene)
            renderScene()
            const error = validate(gltf.scene)
            setError(error)
            setObj(gltf.scene)
          })
        } else {
          const loader = new FBXLoader()
          const scene = loader.parse(fileData.target!.result, file.name)
          scene.name = 'avatar'
          scene.add(scene)
          renderScene()
          const error = validate(scene)
          setError(error)
          setObj(scene)
        }
      } catch (error) {
        console.error(error)
        setError(t('user:avatar.selectValidFile'))
      }
    }

    try {
      reader.readAsArrayBuffer(file)
      fileSelected = true
      setSelectedFile(e.target.files[0])
    } catch (error) {
      console.error(e)
      setError(t('user:avatar.selectValidFile'))
    }
  }

  const handleAvatarNameChange = (e) => {
    setAvatarName(e.target.value)
  }

  const handleThumbnailChange = (e) => {
    if (e.target.files[0].size < MIN_AVATAR_FILE_SIZE || e.target.files[0].size > MAX_AVATAR_FILE_SIZE) {
      setError(
        t('user:avatar.fileOversized', {
          minSize: MIN_AVATAR_FILE_SIZE / 1048576,
          maxSize: MAX_AVATAR_FILE_SIZE / 1048576
        })
      )
      return
    }

    try {
      thumbnailSelected = true
      setSelectedThumbnail(e.target.files[0])
    } catch (error) {
      console.error(e)
      setError(t('user:avatar.selectValidThumbnail'))
    }
  }

  const validate = (vScene) => {
    const objBoundingBox = new THREE.Box3().setFromObject(vScene)
    if (renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
      return t('user:avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

    if (renderer.info.render.triangles <= 0) return t('user:avatar.emptyObj')

    const size = new THREE.Vector3().subVectors(maxBB, objBoundingBox.getSize(new THREE.Vector3()))
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

  const openAvatarMenu = (e) => {
    e.preventDefault()
    changeActiveMenu(Views.Avatar)
  }

  const uploadAvatar = () => {
    if (obj == null) return
    const error = validate(obj)
    if (error) {
      setError(error)
      return
    }

    const canvas = document.createElement('canvas')
    ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)
    const newContext = canvas.getContext('2d')
    newContext?.drawImage(renderer.domElement, 0, 0)

    if (selectedThumbnail == null)
      canvas.toBlob(async (blob) => {
        await AuthService.uploadAvatarModel(selectedFile, blob!, avatarName, isPublicAvatar)
        changeActiveMenu(Views.Profile)
      })
    else {
      AuthService.uploadAvatarModel(selectedFile, selectedThumbnail, avatarName, isPublicAvatar)
      changeActiveMenu(Views.Profile)
    }
  }

  return (
    <div className={styles.avatarUploadPanel}>
      <div className={styles.avatarHeaderBlock}>
        <button type="button" className={styles.iconBlock} onClick={openAvatarMenu}>
          <ArrowBack />
        </button>
        <h2>{t('user:avatar.title')}</h2>
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
              <IconLeftClick />
              <br />- <span>{t('user:avatar.rotate')}</span>
            </div>
            <div>
              <span className={styles.shiftKey}>Shift</span> + <IconLeftClick />
              <br />- <span>{t('user:avatar.pan')}</span>
            </div>
          </div>
        </div>
      </div>
      {selectedThumbnail != null && (
        <div className={styles.thumbnailContainer}>
          <img
            src={URL.createObjectURL(selectedThumbnail)}
            alt={selectedThumbnail?.name}
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
          onChange={handleAvatarNameChange}
          placeholder="Avatar Name"
        />
      </div>
      <div className={styles.selectLabelContainer}>
        <div className={styles.avatarSelectLabel + ' ' + (error ? styles.avatarSelectError : '')}>
          {error ? error : fileSelected ? selectedFile.name : t('user:avatar.selectAvatar')}
        </div>
        <div className={styles.thumbnailSelectLabel + ' ' + (error ? styles.thumbnailSelectError : '')}>
          {error ? error : thumbnailSelected ? selectedThumbnail.name : t('user:avatar.selectThumbnail')}
        </div>
      </div>
      <input
        type="file"
        id="avatarSelect"
        accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
        hidden
        onChange={handleAvatarChange}
      />
      <input
        type="file"
        id="thumbnailSelect"
        accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
        hidden
        onChange={handleThumbnailChange}
      />
      <div className={styles.controlContainer}>
        <div className={styles.selectBtns}>
          <button type="button" className={styles.browseBtn} onClick={handleBrowse}>
            {t('user:avatar.lbl-browse')}
            <SystemUpdateAlt />
          </button>
          <button type="button" className={styles.thumbnailBtn} onClick={handleThumbnail}>
            {t('user:avatar.lbl-thumbnail')}
            <AccountCircle />
          </button>
        </div>
        <button type="button" className={styles.uploadBtn} onClick={uploadAvatar} disabled={!fileSelected || !!error}>
          {t('user:avatar.lbl-upload')}
          <CloudUpload />
        </button>
      </div>
    </div>
  )
}

export default AvatarSelectMenu
