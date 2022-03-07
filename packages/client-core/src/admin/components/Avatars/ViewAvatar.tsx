import _ from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  REGEX_VALID_URL
} from '@xrengine/common/src/constants/AvatarConstants'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { loadAvatarModelAsset } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'

import { Save } from '@mui/icons-material'
import { SystemUpdateAlt } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { initialize3D, renderScene } from '../../../user/components/UserMenu/menus/helperFunctions'
import AlertMessage from '../../common/AlertMessage'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AvatarService } from '../../services/AvatarService'
import { useStyles } from '../../styles/ui'
import AvatarDetail from './AvatarDetail'

const Input = styled('input')({
  display: 'none'
})

interface Props {
  openView: boolean
  closeViewModel?: any
  avatarData: any
}

let camera: PerspectiveCamera
let scene: Scene
let renderer: WebGLRenderer = null!
const ViewAvatar = (props: Props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const { openView, closeViewModel, avatarData } = props
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({
    name: '',
    key: '',
    url: '',
    description: '',
    formErrors: {
      name: '',
      key: '',
      url: '',
      description: ''
    }
  })
  const [selectUse, setSelectUse] = useState(false)
  const [avatarModel, setAvatarModel] = useState<any>(null)
  const [fileSelected, setFileSelected] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [openAlter, setOpenAlter] = useState(false)
  const [error, setError] = useState('')
  const [selectedAvatarlUrl, setSelectedAvatarUrl] = useState<any>(null)

  const ref = useRef(null)
  const handleCloseDrawer = () => {
    closeViewModel(false)
  }

  const initialData = () => {
    setState({
      ...state,
      name: avatarData.name || '',
      key: avatarData.key || '',
      url: avatarData.url || '',
      description: avatarData.description || '',
      formErrors: {
        name: '',
        key: '',
        url: '',
        description: ''
      }
    })
  }

  useEffect(() => {
    if (avatarData) {
      initialData()
    }
  }, [avatarData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleAvatarUrlChange = (event) => {
    setState({ ...state, url: event.target.value })
    if (/\.(?:gltf|glb|vrm)/.test(event.target.value) && REGEX_VALID_URL.test(event.target.value)) {
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
      fetch(event.target.value)
        .then((res) => res.blob())
        .then((data) => setSelectedAvatarUrl(data))
        .catch((err) => {
          setError(err.message)
          console.log(err.message)
        })
    } else {
      setError('Url must be valid')
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

  const updateAvatar = async () => {
    const data = {
      name: state.name,
      description: state.description,
      url: state.url,
      staticResourceType: 'avatar',
      key: avatarData?.key
    }
    let temp = state.formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.description) {
      temp.description = "Description can't be empty"
    }
    if (!state.url) {
      temp.url = "avatar url can't be empty"
    }
    if (validateForm(state, state.formErrors)) {
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 250
      const newContext = canvas.getContext('2d')
      const img = document.getElementById('avatar')
      const imgConvas: any = renderer ? renderer.domElement : img
      newContext?.drawImage(imgConvas, -20, 20)
      if (selectedFile) {
        canvas.toBlob(async (blob) => {
          await AvatarService.updateAdminAvatar(avatarData.id, new File([blob!], data.name), selectedFile, data)
        })
      }

      if (selectedAvatarlUrl) {
        canvas.toBlob(async (blob) => {
          await AvatarService.updateAdminAvatar(avatarData.id, new File([blob!], data.name), selectedAvatarlUrl, data)
        })
      }
      // await AvatarService.updateAdminAvatar(avatarData.id, data)
      setEditMode(false)
      closeViewModel(false)
    } else {
      setError('Please fill all required field')
      setOpenAlter(true)
    }
  }

  const handleCloseAlter = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenAlter(false)
  }

  return (
    <React.Fragment>
      <Drawer
        anchor="right"
        open={openView}
        onClose={() => handleCloseDrawer()}
        classes={{ paper: classes.paperDrawer }}
      >
        {avatarData && (
          <Paper elevation={3} className={classes.rootPaper}>
            <Container maxWidth="sm" className={classes.pad}>
              <Grid container spacing={2} className={classes.centering}>
                <Grid item xs={4}>
                  <Avatar className={classes.large} alt="avatar" src={avatarData.url} />
                </Grid>
                <Grid item xs={8}>
                  <div>
                    <Typography variant="h4" component="span" className={classes.typoFontTitle}>
                      {avatarData.name}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </Container>
          </Paper>
        )}
        <Container maxWidth="sm">
          {editMode ? (
            <div className={classes.mt10}>
              <Typography variant="h4" component="h4" className={`${classes.mb10} ${classes.headingFont}`}>
                Update avatar Information
              </Typography>
              <label>Name</label>
              <Paper
                component="div"
                className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="name"
                  placeholder="Enter name"
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.name}
                  onChange={handleInputChange}
                />
              </Paper>
              <label>Description</label>
              <Paper
                component="div"
                className={state.formErrors.description.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="description"
                  placeholder="Enter description"
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.description}
                  onChange={handleInputChange}
                />
              </Paper>
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
                <>
                  <InputText
                    value={state.url}
                    handleInputChange={handleAvatarUrlChange}
                    formErrors={state.formErrors.url}
                    name="avatarUrl"
                  />
                  <div id="stage" style={{ width: '500px', height: '250px' }}>
                    <img src={state.url} alt="avatar" id="avatar" />
                  </div>
                </>
              ) : (
                <>
                  <div id="stage" style={{ width: '500px', height: '250px' }}></div>
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
              {/* <label>Avatar url</label>
              <Paper
                component="div"
                className={state.formErrors.url.length > 0 ? classes.redBorder : classes.createInput}
              >
                <InputBase
                  className={classes.input}
                  name="url"
                  placeholder="Enter url"
                  style={{ color: '#fff' }}
                  autoComplete="off"
                  value={state.url}
                  onChange={handleInputChange}
                />
              </Paper> */}
            </div>
          ) : (
            <AvatarDetail avatarData={avatarData} />
          )}
          <DialogActions className={classes.mb10}>
            {editMode ? (
              <div className={classes.marginTop}>
                <Button onClick={updateAvatar} className={classes.saveBtn}>
                  <span style={{ marginRight: '15px' }}>
                    <Save />
                  </span>
                  Submit
                </Button>
                <Button
                  className={classes.saveBtn}
                  onClick={() => {
                    initialData()
                    setEditMode(false)
                    if (selectUse) {
                      setAvatarModel(null)
                      setSelectedFile(null)
                      setFileSelected(false)
                    }
                  }}
                >
                  CANCEL
                </Button>
              </div>
            ) : (
              <div className={classes.marginTop}>
                <Button
                  className={classes.saveBtn}
                  onClick={() => {
                    setEditMode(true)
                  }}
                >
                  EDIT
                </Button>
                <Button onClick={() => handleCloseDrawer()} className={classes.saveBtn}>
                  CANCEL
                </Button>
              </div>
            )}
          </DialogActions>
        </Container>
      </Drawer>
      <AlertMessage open={openAlter} handleClose={handleCloseAlter} severity="warning" message={error} />
    </React.Fragment>
  )
}

export default ViewAvatar
