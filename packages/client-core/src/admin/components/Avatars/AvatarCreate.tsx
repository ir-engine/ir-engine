import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { ArrowBack, Help, SystemUpdateAlt, AccountCircle } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useStyles } from '../../styles/ui'
import InputText from '../../common/InputText'
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
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import * as THREE from 'three'
import AvatarSelectMenu from '../../../user/components/UserMenu/menus/AvatarSelectMenu'
import Drawer from '@mui/material/Drawer'
import Container from '@mui/material/Container'
import { styled } from '@mui/material/styles'
import { AuthService } from '../../../user/services/AuthService'
// '../../../ ../services/AuthService'

let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let camera: THREE.PerspectiveCamera
let maxBB = new THREE.Vector3(2, 2, 2)

const Input = styled('input')({
  display: 'none'
})

const AvatarCreate = ({ handleClose, open }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [selectUse, setSelectUse] = useState(false)
  const [validAvatarUrl, setValidAvatarUrl] = useState(false)
  const [error, setError] = useState('')
  const [obj, setObj] = useState<any>(null)
  const [selectedAvatarlUrl, setSelectedAvatarUrl] = useState<any>(null)
  const [thumbNailUrl, setThumbNailUrl] = useState('')
  const [selectedThumbnailUrl, setSelectedThumbNailUrl] = React.useState<any>(null)
  const [fileSelected, setFileSelected] = React.useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [thumbnailSelected, setThumbnailSelected] = React.useState(false)
  const [selectedThumbnail, setSelectedThumbnail] = useState<any>(null)

  const renderScene = () => {
    renderer.render(scene, camera)
  }

  const handleAvatarNameChange = (e) => {
    e.preventDefault()
    setAvatarName(e.target.value)
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
        await AuthService.uploadAvatarModel(selectedAvatarlUrl, blob!, avatarName, true)
      })
    else {
      AuthService.uploadAvatarModel(selectedAvatarlUrl, selectedThumbnailUrl, avatarName, true)
    }
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paperDrawer }} anchor="right" open={open} onClose={handleClose}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <DialogTitle>
            <IconButton onClick={handleClose}>
              <ArrowBack />
            </IconButton>
            {t('user:avatar.title')}
          </DialogTitle>
          <DialogContent>
            <IconButton className={classes.positionRight}>
              <Help className={classes.spanWhite} />
            </IconButton>

            <div style={{ marginTop: '2rem' }}>
              <InputText
                value={avatarName}
                handleInputChange={handleAvatarNameChange}
                name="avatarname"
                formErrors={[]}
              />
              <Button className={classes.saveBtn} onClick={() => setSelectUse(!selectUse)} style={{ width: '97%' }}>
                {' '}
                {selectUse ? 'Upload files' : 'Use url instead'}
              </Button>
              {selectUse ? (
                <div>
                  <InputText
                    value={avatarUrl}
                    handleInputChange={handleAvatarUrlChange}
                    formErrors={[]}
                    name="avatar"
                  />
                  <InputText
                    value={thumbNailUrl}
                    handleInputChange={handleThumbnailUrlChange}
                    formErrors={[]}
                    name="thumbnail"
                  />
                </div>
              ) : (
                <div>
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
                      // classes={{ root: classes.rootBtn }}
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
                      className={classes.saveBtn}
                    />
                    <Button
                      variant="contained"
                      component="span"
                      // classes={{ root: classes.rootBtn }}
                      endIcon={<AccountCircle />}
                    >
                      Thumbnail
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              className={classes.saveBtn}
              onClick={uploadByUrls}
              disabled={!validAvatarUrl}
              style={{ cursor: !validAvatarUrl ? 'not-allowed' : 'pointer' }}
            >
              Upload
            </Button>
            <Button onClick={handleClose} className={classes.saveBtn}>
              Cancel
            </Button>
          </DialogActions>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default AvatarCreate
