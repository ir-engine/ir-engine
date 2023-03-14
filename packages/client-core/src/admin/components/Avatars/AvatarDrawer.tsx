import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import InputFile from '@etherealengine/client-core/src/common/components/InputFile'
import InputRadio from '@etherealengine/client-core/src/common/components/InputRadio'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import { getCanvasBlob, isValidHttpUrl } from '@etherealengine/client-core/src/common/utils'
import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MAX_THUMBNAIL_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  MIN_THUMBNAIL_FILE_SIZE,
  THUMBNAIL_FILE_ALLOWED_EXTENSIONS,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@etherealengine/common/src/constants/AvatarConstants'
import { AvatarInterface } from '@etherealengine/common/src/interfaces/AvatarInterface'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { getOptionalComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { dispatchAction } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import Button from '@etherealengine/ui/src/Button'
import Container from '@etherealengine/ui/src/Container'
import DialogActions from '@etherealengine/ui/src/DialogActions'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import FormControl from '@etherealengine/ui/src/FormControl'
import FormHelperText from '@etherealengine/ui/src/FormHelperText'
import Icon from '@etherealengine/ui/src/Icon'
import Tooltip from '@etherealengine/ui/src/Tooltip'
import Typography from '@etherealengine/ui/src/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { loadAvatarForPreview, resetAnimationLogic } from '../../../user/components/Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '../../../user/components/Panel3D/useRender3DPanelSystem'
import { useAuthState } from '../../../user/services/AuthService'
import { AvatarService } from '../../../user/services/AvatarService'
import DrawerView from '../../common/DrawerView'
import { AdminAvatarActions, useAdminAvatarState } from '../../services/AvatarService'
import styles from '../../styles/admin.module.scss'

export enum AvatarDrawerMode {
  Create,
  ViewEdit
}

enum ConfirmState {
  None,
  File,
  Url
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
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(ConfirmState.None)

  const renderPanel = useRender3DPanelSystem(panelRef)
  const { entity, camera, scene, renderer } = renderPanel.state

  const { user } = useAuthState().value
  const { thumbnail } = useAdminAvatarState().value

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'static_resource:write')
  const viewMode = mode === AvatarDrawerMode.ViewEdit && !editMode

  let thumbnailSrc = ''
  if (state.source === 'file' && state.thumbnailFile) {
    thumbnailSrc = URL.createObjectURL(state.thumbnailFile)
  } else if (state.source === 'url' && state.thumbnailUrl) {
    thumbnailSrc = state.thumbnailUrl
  }

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

  const updateAvatar = async () => {
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
      resetAnimationLogic(entity.value)
      const avatar = await loadAvatarForPreview(entity.value, url)
      const avatarRigComponent = getOptionalComponent(entity.value, AvatarRigComponent)
      if (avatarRigComponent) {
        avatarRigComponent.rig.Neck.getWorldPosition(camera.value.position)
        camera.value.position.y += 0.2
        camera.value.position.z = 0.6
      }
      setAvatarLoading(false)
      if (avatar) {
        avatar.name = 'avatar'
        scene.value.add(avatar)
      }
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
        await AvatarService.patchAvatar(selectedAvatar, state.name, true, avatarBlob, thumbnailBlob)
      } else await AvatarService.createAvatar(avatarBlob, thumbnailBlob, state.name, true)
      dispatchAction(AdminAvatarActions.avatarUpdated({}))

      onClose()
    }
  }

  const handleGenerateFileThumbnail = () => {
    if (state.thumbnailFile) {
      setShowConfirm(ConfirmState.File)
      return
    }

    handleGenerateThumbnail(true)
  }

  const handleGenerateUrlThumbnail = () => {
    if (state.thumbnailUrl) {
      setShowConfirm(ConfirmState.Url)
      return
    }

    handleGenerateThumbnail(false)
  }

  const handleGenerateThumbnail = async (isFile: boolean) => {
    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(renderer.value.domElement, 0, 0)

    const blob = await getCanvasBlob(canvas)
    if (isFile) {
      setState({ ...state, thumbnailFile: new File([blob!], 'thumbnail.png') })
    } else {
      setState({ ...state, thumbnailUrl: URL.createObjectURL(blob!) })
    }

    setShowConfirm(ConfirmState.None)
  }

  return (
    <Container maxWidth="sm" className={styles.mt10}>
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
            <InputFile
              id="select-avatar"
              name="avatarFile"
              accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
              onChange={handleChangeFile}
            />
            <Button className={styles.gradientButton} component="span" startIcon={<Icon type="Face" />}>
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
        <div ref={panelRef} id="stage" style={{ width: THUMBNAIL_WIDTH + 'px', height: THUMBNAIL_HEIGHT + 'px' }} />

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
                <Icon type="Mouse" fontSize="small" />
              </Typography>

              <br />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t('user:avatar.pan')}:
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.rightClick')} <Icon type="Mouse" fontSize="small" />
              </Typography>

              <br />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {t('admin:components.avatar.zoom')}:
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'center' }}>
                {t('admin:components.avatar.scroll')} <Icon type="Mouse" fontSize="small" />
              </Typography>
            </Box>
          }
        >
          <Icon type="Help" sx={{ position: 'absolute', top: 0, right: 0, margin: 1 }} />
        </Tooltip>
      </Box>

      {state.source === 'file' && (
        <>
          <label htmlFor="select-thumbnail">
            <InputFile
              id="select-thumbnail"
              name="thumbnailFile"
              accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
              onChange={handleChangeFile}
            />
            <Button className={styles.gradientButton} component="span" startIcon={<Icon type="AccountCircle" />}>
              {t('admin:components.avatar.selectThumbnail')}
            </Button>
          </label>

          <Button
            className={styles.gradientButton}
            startIcon={<Icon type="Portrait" />}
            sx={{ marginLeft: 1, width: '250px' }}
            title={t('admin:components.avatar.saveThumbnailTooltip')}
            disabled={!state.avatarFile || avatarLoading}
            onClick={handleGenerateFileThumbnail}
          >
            {t('admin:components.avatar.saveThumbnail')}
          </Button>

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
        <Box sx={{ display: 'flex', alignItems: 'self-end' }}>
          <InputText
            name="thumbnailUrl"
            sx={{ mt: 2, mb: 1, flex: 1 }}
            label={t('admin:components.avatar.thumbnailUrl')}
            value={state.thumbnailUrl}
            error={state.formErrors.thumbnailUrl}
            disabled={viewMode}
            onChange={handleChange}
          />

          <Button
            className={styles.gradientButton}
            startIcon={<Icon type="Portrait" />}
            sx={{ marginLeft: 1, width: '250px' }}
            title={t('admin:components.avatar.saveThumbnailTooltip')}
            disabled={viewMode || !state.avatarUrl || avatarLoading}
            onClick={handleGenerateUrlThumbnail}
          >
            {t('admin:components.avatar.saveThumbnail')}
          </Button>
        </Box>
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

      {showConfirm !== ConfirmState.None && (
        <ConfirmDialog
          open
          description={t('admin:components.avatar.confirmThumbnailReplace')}
          onClose={() => setShowConfirm(ConfirmState.None)}
          onSubmit={() => handleGenerateThumbnail(showConfirm === ConfirmState.File)}
        />
      )}
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
