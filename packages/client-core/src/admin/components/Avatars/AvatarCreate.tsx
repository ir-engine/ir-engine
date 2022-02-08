import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { ArrowBack, Help } from '@mui/icons-material'
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

let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let camera: THREE.PerspectiveCamera
let maxBB = new THREE.Vector3(2, 2, 2)

const AvatarCreate = ({ handleClose, open }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [validAvatarUrl, setValidAvatarUrl] = useState(false)
  const [error, setError] = useState('')
  const [obj, setObj] = useState<any>(null)
  const [selectedAvatarlUrl, setSelectedAvatarUrl] = useState<any>(null)
  const [thumbNailUrl, setThumbNailUrl] = useState('')
  const [selectedThumbnailUrl, setSelectedThumbNailUrl] = React.useState<any>(null)

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

  return (
    <div>
      <Dialog open={open} onClose={handleClose} classes={{ paper: classes.paperDialog }} fullWidth={true} maxWidth="sm">
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

            <InputText value={avatarUrl} handleInputChange={handleAvatarUrlChange} formErrors={[]} name="avatar" />
            <InputText
              value={thumbNailUrl}
              handleInputChange={handleThumbnailUrlChange}
              formErrors={[]}
              name="thumbnail"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Upload</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AvatarCreate
