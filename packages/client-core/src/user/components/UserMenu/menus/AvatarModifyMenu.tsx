import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@xrengine/client-core/src/common/components/Avatar'
import AvatarPreview from '@xrengine/client-core/src/common/components/AvatarPreview'
import Button from '@xrengine/client-core/src/common/components/Button'
import ConfirmDialog from '@xrengine/client-core/src/common/components/ConfirmDialog'
import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import InputFile from '@xrengine/client-core/src/common/components/InputFile'
import InputText from '@xrengine/client-core/src/common/components/InputText'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import { isValidHttpUrl } from '@xrengine/client-core/src/common/utils'
import { getCanvasBlob } from '@xrengine/client-core/src/common/utils'
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

import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import PortraitIcon from '@mui/icons-material/Portrait'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import { AvatarService } from '../../../services/AvatarService'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
  selectedAvatar?: AvatarInterface
}

const defaultState = {
  name: '',
  avatarUrl: '',
  thumbnailUrl: '',
  avatarFile: undefined as File | undefined,
  thumbnailFile: undefined as File | undefined,
  formErrors: {
    name: '',
    avatar: '',
    thumbnail: ''
  }
}

const AvatarModifyMenu = ({ changeActiveMenu }: Props) => {
  const { t } = useTranslation()
  const [state, setState] = useState({ ...defaultState })
  const [avatarSrc, setAvatarSrc] = useState('')
  const [showConfirmThumbnail, setShowConfirmThumbnail] = useState(false)
  const [showConfirmChanges, setShowConfirmChanges] = useState(false)
  const avatarRef = useRef<HTMLInputElement | null>(null)
  const thumbnailRef = useRef<HTMLInputElement | null>(null)

  let thumbnailSrc = state.thumbnailUrl
  if (state.thumbnailFile) {
    thumbnailSrc = URL.createObjectURL(state.thumbnailFile)
  }

  const hasErrors = state.formErrors.name || state.formErrors.avatar || state.formErrors.thumbnail ? true : false

  const hasPendingChanges = state.name && avatarSrc && thumbnailSrc ? true : false

  useEffect(() => {
    updateAvatar()
  }, [state.avatarFile, state.avatarUrl])

  const updateAvatar = async () => {
    let url = ''
    if (state.avatarFile && !state.formErrors.avatar) {
      await state.avatarFile.arrayBuffer()

      const assetType = AssetLoader.getAssetType(state.avatarFile.name)
      if (assetType) {
        url = URL.createObjectURL(state.avatarFile) + '#' + state.avatarFile.name
      }
    } else if (state.avatarUrl && !state.formErrors.avatar) {
      url = state.avatarUrl
    }

    setAvatarSrc(url)
  }

  const handleChangeFile = (e) => {
    const { name, files } = e.target

    if (files.length === 0) {
      return
    }

    let tempState = { ...state }
    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'avatarFile': {
        const inValidSize = files[0].size < MIN_AVATAR_FILE_SIZE || files[0].size > MAX_AVATAR_FILE_SIZE
        tempErrors.avatar = inValidSize
          ? t('admin:components.avatar.avatarFileOversized', {
              minSize: MIN_AVATAR_FILE_SIZE / 1048576,
              maxSize: MAX_AVATAR_FILE_SIZE / 1048576
            })
          : ''
        if (!tempErrors.avatar) {
          tempState.avatarUrl = files[0].name
        }

        break
      }
      case 'thumbnailFile': {
        const inValidSize = files[0].size < MIN_THUMBNAIL_FILE_SIZE || files[0].size > MAX_THUMBNAIL_FILE_SIZE
        tempErrors.thumbnail = inValidSize
          ? t('admin:components.avatar.thumbnailFileOversized', {
              minSize: MIN_THUMBNAIL_FILE_SIZE / 1048576,
              maxSize: MAX_THUMBNAIL_FILE_SIZE / 1048576
            })
          : ''

        if (!tempErrors.thumbnail) {
          tempState.thumbnailUrl = files[0].name
        }

        break
      }
      default:
        break
    }

    setState({ ...tempState, [name]: files[0], formErrors: tempErrors })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'name':
        tempErrors.name = value.length < 2 ? t('admin:components.avatar.nameRequired') : ''
        break
      case 'avatarUrl': {
        if (state.avatarFile) return

        let error = ''

        if (value) {
          const validEndsWith = AVATAR_FILE_ALLOWED_EXTENSIONS.split(',').some((suffix) => {
            return value.endsWith(suffix)
          })
          error = !(isValidHttpUrl(value) && validEndsWith) ? t('admin:components.avatar.avatarUrlInvalid') : ''
        }

        tempErrors.avatar = error
        break
      }
      case 'thumbnailUrl': {
        if (state.thumbnailFile) return

        let error = ''

        if (value) {
          const validEndsWith = THUMBNAIL_FILE_ALLOWED_EXTENSIONS.split(',').some((suffix) => {
            return value.endsWith(suffix)
          })
          error = !(isValidHttpUrl(value) && validEndsWith) ? t('admin:components.avatar.thumbnailUrlInvalid') : ''
        }

        tempErrors.thumbnail = error
        break
      }
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleGenerateThumbnail = () => {
    if (thumbnailSrc) {
      setShowConfirmThumbnail(true)
      return
    }

    handleProcessGenerateThumbnail()
  }

  const handleProcessGenerateThumbnail = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    const avatarCanvas = document.getElementById('stage')?.firstChild as CanvasImageSource

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(avatarCanvas, 0, 0)

    const blob = await getCanvasBlob(canvas)
    setState({ ...state, thumbnailUrl: 'thumbnail.png', thumbnailFile: new File([blob!], 'thumbnail.png') })

    setShowConfirmThumbnail(false)
  }

  const handleSave = async () => {
    let avatarBlob: Blob | undefined = undefined
    let thumbnailBlob: Blob | undefined = undefined

    if (state.avatarFile) {
      avatarBlob = state.avatarFile
    } else if (state.avatarUrl) {
      const avatarData = await fetch(state.avatarUrl)
      avatarBlob = await avatarData.blob()
    }

    if (state.thumbnailFile) {
      thumbnailBlob = state.thumbnailFile
    } else if (state.thumbnailUrl) {
      const thumbnailData = await fetch(state.thumbnailUrl)
      thumbnailBlob = await thumbnailData.blob()
    }

    if (avatarBlob && thumbnailBlob) {
      await AvatarService.createAvatar(avatarBlob, thumbnailBlob, state.name, false)

      changeActiveMenu(Views.Closed)
    }
  }

  const handleBack = () => {
    if (hasPendingChanges) {
      setShowConfirmChanges(true)
    } else {
      changeActiveMenu(Views.AvatarSelect)
    }
  }

  return (
    <Menu
      open
      showBackButton
      actions={
        <Box display="flex" width="100%">
          <Button
            disabled={!hasPendingChanges || hasErrors}
            startIcon={<CheckIcon />}
            size="medium"
            type="gradientRounded"
            title={t('user:common.save')}
            onClick={handleSave}
          >
            {t('user:common.save')}
          </Button>
        </Box>
      }
      title={
        t('user:avatar.createAvatar')
        // : t('user:avatar.titleEditAvatar')
      }
      onBack={handleBack}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent}>
        <Grid container spacing={2}>
          <Grid item md={7} sx={{ width: '100%' }}>
            <Box padding="10px 0">
              <AvatarPreview
                avatarUrl={avatarSrc}
                sx={{ width: `${THUMBNAIL_WIDTH}px`, height: `${THUMBNAIL_HEIGHT}px`, m: 'auto' }}
              />
            </Box>
          </Grid>

          <Grid item md={5} sx={{ width: '100%' }}>
            <Button fullWidth type="gradientRounded" sx={{ mt: 1 }} onClick={() => changeActiveMenu(Views.ReadyPlayer)}>
              {t('user:usermenu.profile.useReadyPlayerMe')}
            </Button>

            <InputText
              name="name"
              label={t('user:avatar.name')}
              value={state.name}
              error={state.formErrors.name}
              sx={{ mt: 2 }}
              onChange={handleChange}
            />

            <InputText
              name="avatarUrl"
              label={t('user:avatar.avatar')}
              placeholder={t('user:avatar.enterAvatarUrl')}
              value={state.avatarUrl}
              error={state.formErrors.avatar}
              sx={{ mt: 2 }}
              endIcon={state.avatarFile ? <ClearIcon /> : undefined}
              endControl={
                <IconButton
                  icon={<FileUploadIcon />}
                  title={t('admin:components.avatar.selectAvatar')}
                  type="gradient"
                  sx={{ ml: 1 }}
                  onClick={() => avatarRef.current && avatarRef.current.click()}
                />
              }
              onChange={handleChange}
              onEndIconClick={() => {
                setState({ ...state, avatarUrl: '', avatarFile: undefined })
                if (avatarRef.current) avatarRef.current.value = ''
              }}
            />

            <InputFile
              ref={avatarRef}
              name="avatarFile"
              accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
              onChange={handleChangeFile}
            />

            <InputText
              name="thumbnailUrl"
              label={t('user:avatar.thumbnail')}
              placeholder={t('user:avatar.enterThumbnailUrl')}
              value={state.thumbnailUrl}
              error={state.formErrors.thumbnail}
              sx={{ mt: 2, mb: 1 }}
              endIcon={state.thumbnailFile ? <ClearIcon /> : undefined}
              endControl={
                <IconButton
                  icon={<FileUploadIcon />}
                  title={t('admin:components.avatar.selectThumbnail')}
                  type="gradient"
                  sx={{ ml: 1 }}
                  onClick={() => thumbnailRef.current && thumbnailRef.current.click()}
                />
              }
              onChange={handleChange}
              onEndIconClick={() => {
                setState({ ...state, thumbnailUrl: '', thumbnailFile: undefined })
                if (thumbnailRef.current) thumbnailRef.current.value = ''
              }}
            />

            <InputFile
              ref={thumbnailRef}
              name="thumbnailFile"
              accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
              onChange={handleChangeFile}
            />

            <Avatar imageSrc={thumbnailSrc} type="thumbnail" size={100} sx={{ margin: '20px auto' }} />

            <Button
              disabled={!state.avatarUrl}
              fullWidth
              startIcon={<PortraitIcon />}
              sx={{ mb: 0, mt: 0 }}
              type="gradientRounded"
              onClick={handleGenerateThumbnail}
            >
              {t('admin:components.avatar.saveThumbnail')}
            </Button>

            {showConfirmThumbnail && (
              <ConfirmDialog
                open
                description={t('admin:components.avatar.confirmThumbnailReplace')}
                onClose={() => setShowConfirmThumbnail(false)}
                onSubmit={handleProcessGenerateThumbnail}
              />
            )}

            {showConfirmChanges && (
              <ConfirmDialog
                open
                description={t('user:common.confirmDiscardChange')}
                submitButtonText={t('user:common.discardChanges')}
                onClose={() => setShowConfirmChanges(false)}
                onSubmit={() => changeActiveMenu(Views.AvatarSelect)}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </Menu>
  )
}

export default AvatarModifyMenu
