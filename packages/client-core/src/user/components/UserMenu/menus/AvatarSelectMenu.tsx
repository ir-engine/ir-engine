import { AccountCircle, ArrowBack, CloudUpload, Help, SystemUpdateAlt } from '@mui/icons-material'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_ALLOWED_TRIANGLES,
  MAX_AVATAR_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  THUMBNAIL_FILE_ALLOWED_EXTENSIONS,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
  REGEX_VALID_URL
} from '@xrengine/common/src/constants/AvatarConstants'
import { FBXLoader } from '@xrengine/engine/src/assets/loaders/fbx/FBXLoader'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import IconLeftClick from '../../../../common/components/Icons/IconLeftClick'
import { AuthService } from '../../../services/AuthService'
import styles from '../UserMenu.module.scss'
import { Views } from '../util'
import { useStyle } from './style'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import IconButton from '@mui/material/IconButton'
import InputText from '../../../../admin/common/InputText'

interface Props {
  changeActiveMenu: Function
  uploadAvatarModel?: Function
  isPublicAvatar?: boolean
}

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer

const Input = styled('input')({
  display: 'none'
})

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}

export const AvatarSelectMenu = (props: Props) => {
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null)
  const [avatarName, setAvatarName] = useState('')
  const [error, setError] = useState('')
  const [obj, setObj] = useState<any>(null)
  const classes = useStyle()
  const [value, setValue] = React.useState(0)
  const [avatarUrl, setAvatarUrl] = React.useState('')
  const [thumbNailUrl, setThumbNailUrl] = React.useState('')
  const [validAvatarUrl, setValidAvatarUrl] = React.useState(false)
  const [selectedThumbnailUrl, setSelectedThumbNailUrl] = React.useState<any>(null)
  const [selectedAvatarlUrl, setSelectedAvatarUrl] = React.useState<any>(null)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const handleThumbnailUrlChange = (event) => {
    event.preventDefault()
    setThumbNailUrl(event.target.value)
    if (REGEX_VALID_URL.test(event.target.value)) {
      fetch(event.target.value)
        .then((res) => res.blob())
        .then((data) => setSelectedThumbNailUrl(data))
        .catch((err) => {
          setError(err.message)
        })
    }
  }

  const handleAvatarUrlChange = (event) => {
    event.preventDefault()
    setAvatarUrl(event.target.value)
    if (/\.(?:gltf|glb|vrm)/.test(event.target.value) && REGEX_VALID_URL.test(event.target.value)) {
      setValidAvatarUrl(true)
      AssetLoader.load(event.target.value, (gltf) => {
        gltf.scene.name = 'avatar'
        scene.add(gltf.scene)
        renderScene()
        const error = validate(gltf.scene)
        setError(error)
        setObj(gltf.scene)
      })

      fetch(event.target.value)
        .then((res) => res.blob())
        .then((data) => setSelectedAvatarUrl(data))
        .catch((err) => {
          setError(err.message)
          console.log(err.message)
        })
    } else {
      setValidAvatarUrl(false)
    }
  }

  const { isPublicAvatar, changeActiveMenu, uploadAvatarModel } = props

  const [fileSelected, setFileSelected] = React.useState(false)
  const [thumbnailSelected, setThumbnailSelected] = React.useState(false)
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
        const assetType = AssetLoader.getAssetType(file.name)
        if (assetType) {
          ;(AssetLoader.getLoader(assetType) as any).parse(fileData.target?.result!, '', (gltf) => {
            gltf.scene.name = 'avatar'
            scene.add(gltf.scene)
            renderScene()
            const error = validate(gltf.scene)
            setError(error)
            setObj(gltf.scene)
          })
        } else {
          //@ts-ignore
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
      setFileSelected(true)
      setSelectedFile(e.target.files[0])
    } catch (error) {
      console.error(e)
      setError(t('user:avatar.selectValidFile'))
    }
  }

  const handleAvatarNameChange = (e) => {
    e.preventDefault()
    setAvatarName(e.target.value)
  }

  const uploadByUrls = () => {
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

    if (selectedThumbnailUrl == null)
      canvas.toBlob(async (blob) => {
        await AuthService.uploadAvatarModel(selectedAvatarlUrl, blob!, avatarName, isPublicAvatar)
        changeActiveMenu(Views.Profile)
      })
    else {
      AuthService.uploadAvatarModel(selectedAvatarlUrl, selectedThumbnailUrl, avatarName, isPublicAvatar)
      changeActiveMenu(Views.Profile)
    }
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
      setThumbnailSelected(true)
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
        <IconButton className={styles.iconBlock} onClick={openAvatarMenu}>
          <ArrowBack />
        </IconButton>
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
      {thumbNailUrl.length > 0 && (
        <div className={styles.thumbnailContainer}>
          <img src={thumbNailUrl} alt="Avatar" className={styles.thumbnailPreview} />
        </div>
      )}
      <InputText value={avatarName} handleInputChange={handleAvatarNameChange} name="avatarname" formErrors={[]} />
      {/* <Paper className={classes.paper2}>
        <InputBase
          sx={{ ml: 1, flex: 1, color: '#ccc' }}
          inputProps={{ 'aria-label': 'avatar url' }}
          classes={{ input: classes.input }}
          value={avatarName}
          id="avatarName"
          size="small"
          name="avatarname"
          onChange={handleAvatarNameChange}
          placeholder="Avatar Name"
        />
      </Paper> */}
      <div>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          classes={{ root: classes.tabRoot, indicator: classes.selected }}
        >
          <Tab
            style={value == 0 ? { color: '#f1f1f1', fontWeight: 'bold' } : { color: '#54585d' }}
            label="Use URL"
            {...a11yProps(0)}
            classes={{ root: classes.tabRoot }}
          />
          <Tab
            style={
              value == 1
                ? { color: '#f1f1f1', fontWeight: 'bold', cursor: 'pointer', border: '1px solid red' }
                : { color: '#54585d' }
            }
            label="Upload Files"
            {...a11yProps(1)}
          />
        </Tabs>
      </div>
      <TabPanel value={value} index={0}>
        <div className={styles.controlContainer}>
          <div className={styles.selectBtns} style={{ margin: '14px 0' }}>
            <InputText value={avatarUrl} handleInputChange={handleAvatarUrlChange} formErrors={[]} name="avatar" />
            <InputText
              value={thumbNailUrl}
              handleInputChange={handleThumbnailUrlChange}
              formErrors={[]}
              name="thumbnail"
            />
            {/* <Paper className={classes.paper} style={{ marginRight: '8px', padding: '4px 0' }}>
              <InputBase
                sx={{ ml: 1, flex: 1, color: '#ccc' }}
                placeholder="Paste Avatar Url..."
                inputProps={{ 'aria-label': 'avatar url' }}
                classes={{ input: classes.input }}
                value={avatarUrl}
                onChange={handleAvatarUrlChange}
              />
            </Paper> */}
            {/* <Paper className={classes.paper} style={{ padding: '4px 0' }}>
              <InputBase
                sx={{ ml: 1, flex: 1, color: '#ccc' }}
                placeholder="Paste Thumbnail Url..."
                inputProps={{ 'aria-label': 'thumbnail url' }}
                classes={{ input: classes.input }}
                value={thumbNailUrl}
                onChange={handleThumbnailUrlChange}
              />
            </Paper> */}
          </div>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={uploadByUrls}
            disabled={!validAvatarUrl}
            style={{ cursor: !validAvatarUrl ? 'not-allowed' : 'pointer' }}
          >
            {t('user:avatar.lbl-upload')}
            <CloudUpload />
          </button>
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        {error.length > 0 && (
          <div className={styles.selectLabelContainer}>
            <div className={styles.avatarSelectError}>{error}</div>
          </div>
        )}
        <div className={styles.controlContainer}>
          <div className={styles.selectBtns}>
            <label htmlFor="contained-button-file" style={{ marginRight: '8px' }}>
              <Input
                accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
                id="contained-button-file"
                type="file"
                onChange={handleAvatarChange}
              />
              <Button
                variant="contained"
                component="span"
                classes={{ root: classes.rootBtn }}
                endIcon={<SystemUpdateAlt />}
              >
                Avatar
              </Button>
            </label>
            <label htmlFor="contained-button-file-t">
              <Input
                accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
                id="contained-button-file-t"
                type="file"
                onChange={handleThumbnailChange}
              />
              <Button
                variant="contained"
                component="span"
                classes={{ root: classes.rootBtn }}
                endIcon={<AccountCircle />}
              >
                Thumbnail
              </Button>
            </label>
          </div>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={uploadAvatar}
            style={{ cursor: !fileSelected || !!error ? 'not-allowed' : 'pointer' }}
            disabled={!fileSelected || !!error}
          >
            {t('user:avatar.lbl-upload')}
            <CloudUpload />
          </button>
        </div>
      </TabPanel>

      <div></div>
    </div>
  )
}

export default AvatarSelectMenu
