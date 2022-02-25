import React, { useState, useRef } from 'react'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { ArrowBack, Help, SystemUpdateAlt } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

import AlertMessage from '../../common/AlertMessage'
import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE
} from '@xrengine/common/src/constants/AvatarConstants'
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { loadAvatarModelAsset } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { initialize3D, renderScene } from '../../../user/components/UserMenu/menus/helperFunctions'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AvatarService } from '../../services/AvatarService'
import { useStyles } from '../../styles/ui'

const Input = styled('input')({
  display: 'none'
})

let camera: PerspectiveCamera
let scene: Scene
let renderer: WebGLRenderer = null!
const AvatarCreate = ({ handleClose, open }) => {
  const { t } = useTranslation()
  const classes = useStyles()
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
  const [avatarModel, setAvatarModel] = useState<any>(null)
  const [fileSelected, setFileSelected] = React.useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const panelRef = useRef<any>()

  console.log(selectedFile, fileSelected, avatarModel)
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
    const data = {
      name: newAvatar.avatarName,
      description: newAvatar.description,
      url: newAvatar.avatarUrl,
      staticResourceType: 'avatar'
    }
    let temp = formErrors
    if (!newAvatar.avatarName) {
      temp.avatarName = "Name can't be empty"
    }
    if (!newAvatar.description) {
      temp.description = "Description can't be empty"
    }
    // if (!newAvatar.avatarUrl) {
    //   temp.avatarUrl = "avatar url can't be empty"
    // }
    if (validateForm(newAvatar, formErrors)) {
      const canvas = document.createElement('canvas')
      const newContext = canvas.getContext('2d')
      newContext?.drawImage(renderer.domElement, 0, 0)
      canvas.toBlob(async (blob) => {
        await AvatarService.createAdminAvatar(blob!, selectedFile, data)
      })
      clearState()
      handleClose()
    } else {
      setError('Please fill all required field')
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
                setAvatarModel(null!)
                setError('Failed to load')
                return
              }
              obj.name = 'avatar'
              scene.add(obj)
              renderScene({ scene, renderer, camera })
              setAvatarModel(obj)
              // const error = validate(obj)
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

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paperDrawer }} anchor="right" open={open} onClose={handleClose}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <div ref={panelRef}>
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
                  className={classes.saveBtn}
                  onClick={() => {
                    setSelectUse(!selectUse)
                    if (!selectUse) {
                      setAvatarModel(null)
                      setSelectedFile(null)
                      setFileSelected(false)
                    }
                  }}
                  style={{ width: '97%' }}
                >
                  {!selectUse ? 'Upload files' : 'Use url instead'}
                </Button>
                {!selectUse ? (
                  <InputText
                    value={newAvatar.avatarUrl}
                    handleInputChange={handleChangeInput}
                    formErrors={formErrors.avatarUrl}
                    name="avatarUrl"
                  />
                ) : (
                  <>
                    <div id="stage" style={{ width: '400px', height: '200px' }}></div>
                    <label htmlFor="contained-button-file" style={{ marginRight: '8px' }}>
                      <Input
                        accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
                        id="contained-button-file"
                        type="file"
                        onChange={handleAvatarChange}
                        disabled={avatarModel ? true : false}
                      />
                      <Button
                        variant="contained"
                        component="span"
                        // classes={{ root: classes.rootBtn }}
                        endIcon={<SystemUpdateAlt />}
                        disabled={avatarModel ? true : false}
                      >
                        Avatar
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button className={classes.saveBtn} onClick={uploadByUrls}>
                Upload
              </Button>
              <Button
                onClick={() => {
                  handleClose()
                  clearState()
                }}
                className={classes.saveBtn}
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
