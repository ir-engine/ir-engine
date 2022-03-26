import _ from 'lodash'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  REGEX_VALID_URL
} from '@xrengine/common/src/constants/AvatarConstants'
import { CreateEditAdminAvatar } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { loadAvatarModelAsset } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'

import { ArrowBack, Help, SystemUpdateAlt } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

import { initialize3D, renderScene } from '../../../user/components/UserMenu/menus/helperFunctions'
import AlertMessage from '../../common/AlertMessage'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AvatarService } from '../../services/AvatarService'
import styles from '../../styles/admin.module.scss'

const Input = styled('input')({
  display: 'none'
})

let camera: PerspectiveCamera
let scene: Scene
let renderer: WebGLRenderer = null!
const AvatarCreate = ({ handleClose, open }) => {
  const { t } = useTranslation()
  const [newAvatar, setNewAvatar] = useState({
    avatarName: '',
    avatarUrl: '',
    description: ''
  })
  const [formErrors, setFormErrors] = useState({
    avatarName: '',
    avatarUrl: '',
    description: ''
  })
  const [selectUse, setSelectUse] = useState(false)
  const [openAlter, setOpenAlter] = useState(false)
  const [error, setError] = useState('')
  const [avatarModal, setAvatarModal] = useState<any>(null)
  const [fileSelected, setFileSelected] = React.useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [validAvatarUrl, setValidAvatarUrl] = useState(false)
  const [selectedAvatarlUrl, setSelectedAvatarUrl] = useState<any>(null)

  const panelRef = useRef<any>()

  const handleChangeInput = (e) => {
    const names = e.target.name
    const value = e.target.value
    let temp = formErrors
    temp[names] = value.length < 2 ? `${_.upperFirst(names)} is required` : ''
    setFormErrors(temp)
    setNewAvatar({ ...newAvatar, [names]: value })
  }

  const clearState = () => {
    setNewAvatar({
      ...newAvatar,
      avatarName: '',
      avatarUrl: '',
      description: ''
    })
    setFormErrors({
      ...formErrors,
      avatarName: '',
      avatarUrl: '',
      description: ''
    })
  }
  const handleCloseAlter = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenAlter(false)
  }

  const uploadByUrls = async () => {
    const data: CreateEditAdminAvatar = {
      name: newAvatar.avatarName,
      description: newAvatar.description,
      url: newAvatar.avatarUrl,
      staticResourceType: 'avatar'
    }
    let temp = formErrors
    if (!newAvatar.avatarName) {
      temp.avatarName = t('admin:components.avatar.nameCantEmpty')
    }
    if (!newAvatar.description) {
      temp.description = t('admin:components.avatar.descriptionCantEmpty')
    }
    if (!selectUse) {
      temp.avatarUrl = !newAvatar.avatarUrl ? t('admin:components.avatar.avatarUrlCantEmpty') : ''
    } else {
      temp.avatarUrl = !selectedFile ? t('admin:components.avatar.avatarCantEmpty') : ''
    }

    if (validateForm(newAvatar, formErrors)) {
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 250
      const newContext = canvas.getContext('2d')
      newContext?.drawImage(renderer.domElement, -20, 20)
      if (selectedFile) {
        canvas.toBlob(async (blob) => {
          await AvatarService.createAdminAvatar(new File([blob!], data.name), selectedFile, data)
        })
      }

      if (selectedAvatarlUrl) {
        canvas.toBlob(async (blob) => {
          await AvatarService.createAdminAvatar(new File([blob!], data.name), selectedAvatarlUrl, data)
        })
      }
      clearState()
      handleClose()
    } else {
      setError(t('admin:components.avatar.fillRequiredFields'))
      setOpenAlter(true)
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

    const init = initialize3D()
    scene = init.scene
    camera = init.camera
    renderer = init.renderer
    const controls = getOrbitControls(camera, renderer.domElement)

    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()

    scene.children = scene.children.filter((c) => c.name !== 'avatar')
    console.log(scene)

    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (fileData) => {
      try {
        const assetType = AssetLoader.getAssetType(file.name)
        if (assetType) {
          const objectURL = URL.createObjectURL(file) + '#' + file.name
          loadAvatarModelAsset(objectURL)
            .catch((err) => {
              setError(err)
            })
            .then((obj) => {
              if (!obj) {
                setAvatarModal(null!)
                setError('Failed to load')
                return
              }
              obj.name = 'avatar'
              scene.add(obj)
              renderScene({ scene, renderer, camera })
              setAvatarModal(obj)
              // const error = validate(obj)
              setError(error)
              if (error === '') setAvatarModal(obj)
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

  const handleAvatarUrlChange = async (event) => {
    setNewAvatar({ ...newAvatar, avatarUrl: event.target.value })
    if (/\.(?:gltf|glb|vrm)/.test(event.target.value) && REGEX_VALID_URL.test(event.target.value)) {
      setValidAvatarUrl(true)
      const init = initialize3D()
      scene = init.scene
      camera = init.camera
      renderer = init.renderer
      const controls = getOrbitControls(camera, renderer.domElement)

      controls.minDistance = 0.1
      controls.maxDistance = 10
      controls.target.set(0, 1.25, 0)
      controls.update()

      scene.children = scene.children.filter((c) => c.name !== 'avatar')
      loadAvatarModelAsset(event.target.value)
        .catch((err) => {
          setError(err)
        })
        .then((obj) => {
          if (!obj) {
            setAvatarModal(null!)
            setError('Failed to load')
            return
          }
          obj.name = 'avatar'
          scene.add(obj)
          renderScene({ scene, renderer, camera })
          setAvatarModal(obj)
          // const error = validate(obj)
          setError(error)
          if (error === '') setAvatarModal(obj)
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
      setError('Url must be valid')
      setOpenAlter(true)
    }
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: styles.paperDrawer }} anchor="right" open={open} onClose={handleClose}>
        <Container maxWidth="sm" className={styles.mt20}>
          <div ref={panelRef}>
            <DialogTitle>
              <IconButton className={styles.spanWhite} onClick={handleClose}>
                <ArrowBack />
              </IconButton>
              {t('user:avatar.title')}
            </DialogTitle>
            <DialogContent>
              <div style={{ marginTop: '2rem' }}>
                <InputText
                  value={newAvatar.avatarName}
                  handleInputChange={handleChangeInput}
                  name="avatarName"
                  formErrors={formErrors.avatarName}
                />
                <InputText
                  value={newAvatar.description}
                  handleInputChange={handleChangeInput}
                  name="description"
                  formErrors={formErrors.description}
                />
                <Button
                  className={styles.openModalBtn}
                  onClick={() => {
                    setSelectUse(!selectUse)
                    if (!selectUse) {
                      setAvatarModal(null)
                      setSelectedFile(null)
                      setFileSelected(false)
                    }
                  }}
                  style={{ width: '97%', marginBottom: '10px' }}
                >
                  {!selectUse ? 'Upload files' : 'Use url instead'}
                </Button>
                {!selectUse ? (
                  <>
                    <InputText
                      value={newAvatar.avatarUrl}
                      handleInputChange={handleAvatarUrlChange}
                      formErrors={formErrors.avatarUrl}
                      name="avatarUrl"
                    />
                    <div id="stage" style={{ width: '500px', height: '250px' }} />
                  </>
                ) : (
                  <>
                    <div id="stage" style={{ width: '500px', height: '250px' }} />
                    <label htmlFor="contained-button-file" style={{ marginRight: '8px' }}>
                      <Input
                        accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
                        id="contained-button-file"
                        type="file"
                        onChange={handleAvatarChange}
                        disabled={!!avatarModal}
                      />
                      <Button
                        variant="contained"
                        component="span"
                        className={styles.openModalBtn}
                        endIcon={<SystemUpdateAlt />}
                        disabled={!!avatarModal}
                      >
                        Avatar
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button className={styles.submitButton} onClick={uploadByUrls}>
                Upload
              </Button>
              <Button
                onClick={() => {
                  handleClose()
                  clearState()
                }}
                className={styles.cancelButton}
              >
                Cancel
              </Button>
            </DialogActions>
          </div>
        </Container>
      </Drawer>
      <AlertMessage open={openAlter} handleClose={handleCloseAlter} severity="warning" message={error} />
    </React.Fragment>
  )
}

export default AvatarCreate
