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
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import IconLeftClick from '../../../../common/components/Icons/IconLeftClick'
import { AuthService } from '../../../services/AuthService'
import styles from '../UserMenu.module.scss'
import { Views } from '../util'
import { useStyle } from './style'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { loadAvatarForPreview } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { validate, initialize3D, onWindowResize, addAnimationLogic } from './helperFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

interface Props {
  changeActiveMenu: Function
  uploadAvatarModel?: Function
  isPublicAvatar?: boolean
}

let camera: PerspectiveCamera
let scene: Scene
let renderer: WebGLRenderer = null!

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
  const [avatarModel, setAvatarModel] = useState<any>(null)
  const classes = useStyle()
  const [value, setValue] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [thumbNailUrl, setThumbNailUrl] = useState('')
  const [validAvatarUrl, setValidAvatarUrl] = useState(false)
  const [selectedThumbnailUrl, setSelectedThumbNailUrl] = useState<any>(null)
  const [selectedAvatarlUrl, setSelectedAvatarUrl] = useState<any>(null)
  const [entity, setEntity] = useState<any>(null)
  const panelRef = useRef<any>()

  console.log(avatarModel)

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

  const handleAvatarUrlChange = async (event) => {
    event.preventDefault()
    setAvatarUrl(event.target.value)
    if (/\.(?:gltf|glb|vrm)/.test(event.target.value) && REGEX_VALID_URL.test(event.target.value)) {
      setValidAvatarUrl(true)

      loadAvatarForPreview(entity, event.target.value)
        .catch((err) => {
          setError(err)
        })
        .then((obj) => {
          if (!obj) {
            setAvatarModel(null!)
            setError('Failed to load')
            return
          }
          obj.name = 'avatar'
          scene.add(obj)
          const error = validate(obj)
          setError(error)
          if (error === '') setAvatarModel(obj)
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

  const { isPublicAvatar, changeActiveMenu } = props

  const [fileSelected, setFileSelected] = React.useState(false)
  const [thumbnailSelected, setThumbnailSelected] = React.useState(false)

  const { t } = useTranslation()

  useEffect(() => {
    const world = useWorld()
    const entity = createEntity()

    addAnimationLogic(entity, world, setEntity, panelRef)
    const init = initialize3D()
    scene = init.scene
    camera = init.camera
    renderer = init.renderer
    const controls = getOrbitControls(camera, renderer.domElement)

    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()
    window.addEventListener('resize', () => onWindowResize({ scene, camera, renderer }))

    return () => {
      window.removeEventListener('resize', () => onWindowResize({ scene, camera, renderer }))
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
          const objectURL = URL.createObjectURL(file) + '#' + file.name
          loadAvatarForPreview(entity, objectURL)
            .catch((err) => {
              setError(err)
            })
            .then((obj) => {
              if (!obj) {
                setAvatarModel(null!)
                setError('Failed to load')
                return
              }
              obj.name = 'avatar'
              scene.add(obj)
              setAvatarModel(obj)
              const error = validate(obj)
              setError(error)
              if (error === '') setAvatarModel(obj)
            })
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
    if (avatarModel == null) return
    const error = validate(avatarModel)
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

  const openAvatarMenu = (e) => {
    removeEntity(entity)
    setEntity(null)
    e.preventDefault()
    changeActiveMenu(Views.Avatar)
  }

  const uploadAvatar = () => {
    if (avatarModel == null) return
    const error = validate(avatarModel)
    if (error) {
      setError(error)
      return
    }

    if (selectedThumbnail == null) {
      const canvas = document.createElement('canvas')
      ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)
      const newContext = canvas.getContext('2d')
      newContext?.drawImage(renderer.domElement, 0, 0)
      canvas.toBlob(async (blob) => {
        await AuthService.uploadAvatarModel(selectedFile, blob!, avatarName, isPublicAvatar)
        changeActiveMenu(Views.Profile)
      })
    } else {
      AuthService.uploadAvatarModel(selectedFile, selectedThumbnail, avatarName, isPublicAvatar)
      changeActiveMenu(Views.Profile)
    }
  }

  return (
    <div ref={panelRef} className={styles.avatarUploadPanel}>
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
      {thumbNailUrl.length > 0 && (
        <div className={styles.thumbnailContainer}>
          <img src={thumbNailUrl} alt="Avatar" className={styles.thumbnailPreview} />
        </div>
      )}
      <Paper className={classes.paper2}>
        <InputBase
          sx={{ ml: 1, flex: 1, color: '#fff', fontWeight: '700', fontSize: '16px' }}
          inputProps={{ 'aria-label': 'avatar url' }}
          classes={{ input: classes.input }}
          value={avatarName}
          id="avatarName"
          size="small"
          name="avatarname"
          onChange={handleAvatarNameChange}
          placeholder="Avatar Name"
        />
      </Paper>
      <div>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          classes={{ root: classes.tabRoot, indicator: classes.selected }}
        >
          <Tab
            style={
              value == 0
                ? { color: '#ffffff', fontWeight: 'bold', fontSize: '17px', textTransform: 'capitalize' }
                : { color: '#3c2e2e', fontWeight: 'bold', fontSize: '17px', textTransform: 'capitalize' }
            }
            label="Use URL"
            {...a11yProps(0)}
            classes={{ root: classes.tabRoot }}
          />
          <Tab
            style={
              value == 1
                ? { color: '#ffffff', fontWeight: 'bold', fontSize: '17px', textTransform: 'capitalize' }
                : { color: '#3c2e2e', fontWeight: 'bold', fontSize: '17px', textTransform: 'capitalize' }
            }
            label="Upload Files"
            {...a11yProps(1)}
          />
        </Tabs>
      </div>
      <TabPanel value={value} index={0}>
        <div className={styles.controlContainer}>
          <div className={styles.selectBtns} style={{ margin: '14px 0' }}>
            <Paper className={classes.paper} style={{ marginRight: '8px', padding: '4px 0' }}>
              <InputBase
                sx={{ ml: 1, flex: 1, color: '#fff', fontWeight: '700', fontSize: '16px' }}
                placeholder="Paste Avatar Url..."
                inputProps={{ 'aria-label': 'avatar url' }}
                classes={{ input: classes.input }}
                value={avatarUrl}
                onChange={handleAvatarUrlChange}
              />
            </Paper>
            <Paper className={classes.paper} style={{ padding: '4px 0' }}>
              <InputBase
                sx={{ ml: 1, flex: 1, color: '#fff', fontWeight: '700', fontSize: '16px' }}
                placeholder="Paste Thumbnail Url..."
                inputProps={{ 'aria-label': 'thumbnail url' }}
                classes={{ input: classes.input }}
                value={thumbNailUrl}
                onChange={handleThumbnailUrlChange}
              />
            </Paper>
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
    </div>
  )
}

export default AvatarSelectMenu
