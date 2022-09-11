import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MAX_THUMBNAIL_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  MIN_THUMBNAIL_FILE_SIZE,
  THUMBNAIL_FILE_ALLOWED_EXTENSIONS,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@xrengine/common/src/constants/AvatarConstants'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { loadAvatarForPreview } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { dispatchAction } from '@xrengine/hyperflux'

import { Help } from '@mui/icons-material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import FaceIcon from '@mui/icons-material/Face'
import MouseIcon from '@mui/icons-material/Mouse'
import { FormHelperText, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import { styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'

import { NotificationService } from '../../../common/services/NotificationService'
import {
  addAnimationLogic,
  initialize3D,
  onWindowResize
} from '../../../user/components/UserMenu/menus/helperFunctions'
import { useAuthState } from '../../../user/services/AuthService'
import { AvatarService } from '../../../user/services/AvatarService'
import DrawerView from '../../common/DrawerView'
import InputRadio from '../../common/InputRadio'
import InputText from '../../common/InputText'
import LoadingView from '../../common/LoadingView'
import { AdminAvatarActions, AdminAvatarService, useAdminAvatarState } from '../../services/AvatarService'
import styles from '../../styles/admin.module.scss'

let camera: PerspectiveCamera
let scene: Scene
let renderer: WebGLRenderer = null!
let entity: Entity = null!

const Input = styled('input')({
  display: 'none'
})

export enum AvatarDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: AvatarDrawerMode
  selectedAvatar?: AvatarInterface
  onClose: () => void
}

const defaultState = {
  name: '',
  source: 'file',
  avatarUrl: '',
  thumbnailUrl: '',
  avatarFile: undefined as File | undefined,
  thumbnailFile: undefined as File | undefined,
  formErrors: {
    name: '',
    avatarUrl: '',
    thumbnailUrl: '',
    avatarFile: '',
    thumbnailFile: ''
  }
}

const AvatarDrawerContent = ({ open, mode, selectedAvatar, onClose }: Props) => {
  const { t } = useTranslation()
  const containerRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })
  const [avatarLoading, setAvatarLoading] = useState(false)

  const { user } = useAuthState().value
  const { thumbnail } = useAdminAvatarState().value

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'static_resource:write')
  const viewMode = mode === AvatarDrawerMode.ViewEdit && !editMode

  let thumbnailSrc = ''
  if (state.source === 'file' && state.thumbnailFile) {
    thumbnailSrc = URL.createObjectURL(state.thumbnailFile)
  } else if (state.source === 'url' && state.thumbnailUrl) {
    thumbnailSrc = state.thumbnailUrl + '?' + new Date().getTime()
  }

  useEffect(() => {
    const world = useWorld()
    entity = createEntity()

    addAnimationLogic(entity, world, containerRef)

    const init = initialize3D()
    scene = init.scene
    camera = init.camera
    renderer = init.renderer

    const controls = getOrbitControls(camera, renderer.domElement)
    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.5, 0)
    controls.update()

    window.addEventListener('resize', () => onWindowResize({ scene, camera, renderer }))

    return () => {
      removeEntity(entity)
      entity = null!
      window.removeEventListener('resize', () => onWindowResize({ scene, camera, renderer }))
    }
  }, [])

  useEffect(() => {
    const initSelected = async () => {
      if (selectedAvatar?.id) {
        loadSelectedAvatar()
      }
    }

    initSelected()
  }, [selectedAvatar, thumbnail?.url])

  useEffect(() => {
    updateAvatar()
  }, [state.source, state.avatarFile, state.avatarUrl])

  const loadSelectedAvatar = () => {
    if (selectedAvatar) {
      setState({
        ...defaultState,
        name: selectedAvatar.name || '',
        source: 'url',
        avatarUrl: selectedAvatar.modelResource?.url || '',
        thumbnailUrl: selectedAvatar.thumbnailResource?.url || '',
        avatarFile: undefined,
        thumbnailFile: undefined
      })
    }
  }

  const isValidHttpUrl = (urlString) => {
    let url

    try {
      url = new URL(urlString)
    } catch (_) {
      return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
  }

  const updateAvatar = async () => {
    scene.children = scene.children.filter((c) => c.name !== 'avatar')

    let url = ''
    if (state.source === 'url' && state.avatarUrl) {
      const validEndsWith = AVATAR_FILE_ALLOWED_EXTENSIONS.split(',').some((suffix) => {
        return state.avatarUrl.endsWith(suffix)
      })
      url = isValidHttpUrl(state.avatarUrl) && validEndsWith ? state.avatarUrl : ''
    } else if (state.source === 'file' && state.avatarFile) {
      await state.avatarFile.arrayBuffer()

      const assetType = AssetLoader.getAssetType(state.avatarFile.name)
      if (assetType) {
        url = URL.createObjectURL(state.avatarFile) + '#' + state.avatarFile.name
      }
    }

    if (url) {
      setAvatarLoading(true)
      const avatar = await loadAvatarForPreview(entity, url)
      setAvatarLoading(false)
      avatar.name = 'avatar'
      scene.add(avatar)
    }
  }

  const handleCancel = () => {
    if (editMode) {
      loadSelectedAvatar()
      setEditMode(false)
    } else onClose()
  }

  const handleChangeFile = (e) => {
    const { name, files } = e.target

    if (files.length === 0) {
      return
    }

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'avatarFile': {
        const inValidSize = files[0].size < MIN_AVATAR_FILE_SIZE || files[0].size > MAX_AVATAR_FILE_SIZE
        tempErrors.avatarFile = inValidSize
          ? t('admin:components.avatar.avatarFileOversized', {
              minSize: MIN_AVATAR_FILE_SIZE / 1048576,
              maxSize: MAX_AVATAR_FILE_SIZE / 1048576
            })
          : ''
        break
      }
      case 'thumbnailFile': {
        const inValidSize = files[0].size < MIN_THUMBNAIL_FILE_SIZE || files[0].size > MAX_THUMBNAIL_FILE_SIZE
        tempErrors.thumbnailFile = inValidSize
          ? t('admin:components.avatar.thumbnailFileOversized', {
              minSize: MIN_THUMBNAIL_FILE_SIZE / 1048576,
              maxSize: MAX_THUMBNAIL_FILE_SIZE / 1048576
            })
          : ''
        break
      }
      default:
        break
    }

    setState({ ...state, [name]: files[0], formErrors: tempErrors })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'name':
        tempErrors.name = value.length < 2 ? t('admin:components.avatar.nameRequired') : ''
        break
      case 'avatarUrl': {
        const validEndsWith = AVATAR_FILE_ALLOWED_EXTENSIONS.split(',').some((suffix) => {
          return value.endsWith(suffix)
        })
        tempErrors.avatarUrl = !(isValidHttpUrl(value) && validEndsWith)
          ? t('admin:components.avatar.avatarUrlInvalid')
          : ''
        break
      }
      case 'thumbnailUrl': {
        const validEndsWith = THUMBNAIL_FILE_ALLOWED_EXTENSIONS.split(',').some((suffix) => {
          return value.endsWith(suffix)
        })
        tempErrors.thumbnailUrl = !(isValidHttpUrl(value) && validEndsWith)
          ? t('admin:components.avatar.thumbnailUrlInvalid')
          : ''
        break
      }
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleSubmit = async () => {
    let avatarBlob: Blob | undefined = undefined
    let thumbnailBlob: Blob | undefined = undefined

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.avatar.nameCantEmpty'),
      avatarUrl: state.source === 'url' && state.avatarUrl ? '' : t('admin:components.avatar.avatarUrlCantEmpty'),
      thumbnailUrl:
        state.source === 'url' && state.thumbnailUrl ? '' : t('admin:components.avatar.thumbnailUrlCantEmpty'),
      avatarFile: state.source === 'file' && state.avatarFile ? '' : t('admin:components.avatar.avatarFileCantEmpty'),
      thumbnailFile:
        state.source === 'file' && state.thumbnailFile ? '' : t('admin:components.avatar.thumbnailFileCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (
      (state.source === 'file' && (tempErrors.avatarFile || tempErrors.thumbnailFile)) ||
      (state.source === 'url' && (tempErrors.avatarUrl || tempErrors.thumbnailUrl))
    ) {
      NotificationService.dispatchNotify(t('admin:components.common.fixErrorFields'), { variant: 'error' })
      return
    } else if (tempErrors.name) {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
      return
    } else if (state.source === 'file' && state.avatarFile && state.thumbnailFile) {
      avatarBlob = state.avatarFile
      thumbnailBlob = state.thumbnailFile
    } else if (state.source === 'url' && state.avatarUrl && state.thumbnailUrl) {
      const avatarData = await fetch(state.avatarUrl)
      avatarBlob = await avatarData.blob()

      const thumbnailData = await fetch(state.thumbnailUrl)
      thumbnailBlob = await thumbnailData.blob()
    }

    if (avatarBlob && thumbnailBlob) {
      if (selectedAvatar?.id) {
        const uploadResponse = await AvatarService.uploadAvatarModel(
          avatarBlob,
          thumbnailBlob,
          state.name + '_' + selectedAvatar.id,
          selectedAvatar.isPublic
        )
        const removalPromises = [] as any
        if (uploadResponse[0].id !== selectedAvatar.modelResourceId)
          removalPromises.push(AvatarService.removeStaticResource(selectedAvatar.modelResourceId))
        if (uploadResponse[1].id !== selectedAvatar.thumbnailResourceId)
          removalPromises.push(AvatarService.removeStaticResource(selectedAvatar.thumbnailResourceId))
        await Promise.all(removalPromises)
        await AvatarService.patchAvatar(selectedAvatar.id, uploadResponse[0].id, uploadResponse[1].id, state.name)
      } else await AvatarService.createAvatar(avatarBlob, thumbnailBlob, state.name, true)
      dispatchAction(AdminAvatarActions.avatarUpdated({}))

      onClose()
    }
  }

  return (
    <Container ref={containerRef} maxWidth="sm" className={styles.mt10}>
      <DialogTitle className={styles.textAlign}>
        {mode === AvatarDrawerMode.Create && t('user:avatar.createAvatar')}
        {mode === AvatarDrawerMode.ViewEdit &&
          editMode &&
          `${t('admin:components.common.update')} ${selectedAvatar?.name}`}
        {mode === AvatarDrawerMode.ViewEdit && !editMode && selectedAvatar?.name}
      </DialogTitle>

      <InputText
        name="name"
        label={t('admin:components.user.name')}
        value={state.name}
        error={state.formErrors.name}
        disabled={viewMode}
        onChange={handleChange}
      />

      {!viewMode && (
        <InputRadio
          name="source"
          label={t('admin:components.avatar.source')}
          value={state.source}
          options={[
            { value: 'file', label: t('admin:components.avatar.file') },
            { value: 'url', label: t('admin:components.avatar.url') }
          ]}
          onChange={handleChange}
        />
      )}

      {state.source === 'file' && (
        <>
          <label htmlFor="select-avatar">
            <Input
              id="select-avatar"
              name="avatarFile"
              accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
              type="file"
              onChange={handleChangeFile}
            />
            <Button className={styles.gradientButton} component="span" startIcon={<FaceIcon />}>
              {t('admin:components.avatar.selectAvatar')}
            </Button>
          </label>

          {state.formErrors.avatarFile && (
            <Box>
              <FormControl error>
                <FormHelperText className="Mui-error">{state.formErrors.avatarFile}</FormHelperText>
              </FormControl>
            </Box>
          )}
        </>
      )}

      {state.source === 'url' && (
        <InputText
          name="avatarUrl"
          sx={{ mt: 3, mb: 1 }}
          label={t('admin:components.avatar.avatarUrl')}
          value={state.avatarUrl}
          error={state.formErrors.avatarUrl}
          disabled={viewMode}
          onChange={handleChange}
        />
      )}

      <Box
        className={styles.preview}
        style={{ width: THUMBNAIL_WIDTH + 'px', height: THUMBNAIL_HEIGHT + 'px', position: 'relative' }}
      >
        <div id="stage" style={{ width: '100%', height: '100%' }} />

        {avatarLoading && (
          <LoadingView
            title={t('admin:components.avatar.loading')}
            variant="body2"
            sx={{ position: 'absolute', top: 0 }}
          />
        )}

        {((state.source === 'file' && !state.avatarFile) || (state.source === 'url' && !state.avatarUrl)) && (
          <Typography
            sx={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
              fontSize: 14,
              top: 0
            }}
          >
            {t('admin:components.avatar.avatarPreview')}
          </Typography>
        )}

        <Tooltip
          arrow
          title={
            <Box sx={{ width: 100 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t('user:avatar.rotate')}:
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.leftClick')}
                <MouseIcon fontSize="small" />
              </Typography>

              <br />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t('user:avatar.pan')}:
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.rightClick')} <MouseIcon fontSize="small" />
              </Typography>

              <br />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t('admin:components.avatar.zoom')}:
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.scroll')} <MouseIcon fontSize="small" />
              </Typography>
            </Box>
          }
        >
          <Help sx={{ position: 'absolute', top: 0, right: 0, margin: 1 }} />
        </Tooltip>
      </Box>

      {state.source === 'file' && (
        <>
          <label htmlFor="select-thumbnail">
            <Input
              id="select-thumbnail"
              name="thumbnailFile"
              accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
              type="file"
              onChange={handleChangeFile}
            />
            <Button className={styles.gradientButton} component="span" startIcon={<AccountCircleIcon />}>
              {t('admin:components.avatar.selectThumbnail')}
            </Button>
          </label>

          {state.formErrors.thumbnailFile && (
            <Box>
              <FormControl error>
                <FormHelperText className="Mui-error">{state.formErrors.thumbnailFile}</FormHelperText>
              </FormControl>
            </Box>
          )}
        </>
      )}

      {state.source === 'url' && (
        <InputText
          name="thumbnailUrl"
          sx={{ mt: 2, mb: 1 }}
          label={t('admin:components.avatar.thumbnailUrl')}
          value={state.thumbnailUrl}
          error={state.formErrors.thumbnailUrl}
          disabled={viewMode}
          onChange={handleChange}
        />
      )}

      <Box
        className={styles.preview}
        style={{ width: '100px', height: '100px', position: 'relative', marginBottom: 15 }}
      >
        <img src={thumbnailSrc} crossOrigin="anonymous" />
        {((state.source === 'file' && !state.thumbnailFile) || (state.source === 'url' && !state.thumbnailUrl)) && (
          <Typography
            sx={{
              position: 'absolute',
              top: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%',
              fontSize: 14
            }}
          >
            {t('admin:components.avatar.thumbnailPreview')}
          </Typography>
        )}
      </Box>

      <DialogActions>
        <Button className={styles.outlinedButton} onClick={handleCancel}>
          {t('admin:components.common.cancel')}
        </Button>
        {(mode === AvatarDrawerMode.Create || editMode) && (
          <Button className={styles.gradientButton} onClick={handleSubmit}>
            {t('admin:components.common.submit')}
          </Button>
        )}
        {mode === AvatarDrawerMode.ViewEdit && !editMode && (
          <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => setEditMode(true)}>
            {t('admin:components.common.edit')}
          </Button>
        )}
      </DialogActions>
    </Container>
  )
}

const AvatarDrawer = (props: Props) => {
  const { open, onClose } = props
  return (
    <DrawerView open={open} onClose={onClose}>
      <AvatarDrawerContent {...props} />
    </DrawerView>
  )
}

export default AvatarDrawer
