import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@xrengine/client-core/src/common/components/Avatar'
import AvatarPreview from '@xrengine/client-core/src/common/components/AvatarPreview'
import Button from '@xrengine/client-core/src/common/components/Button'
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
    avatarUrl: '',
    thumbnailUrl: '',
    avatarFile: '',
    thumbnailFile: ''
  }
}

const AvatarModifyMenu = ({ changeActiveMenu }: Props) => {
  const { t } = useTranslation()
  const [state, setState] = useState({ ...defaultState })
  const [avatarSrc, setAvatarSrc] = useState('')
  const avatarRef = useRef<HTMLInputElement | null>(null)
  const thumbnailRef = useRef<HTMLInputElement | null>(null)

  let thumbnailSrc = state.thumbnailUrl
  if (state.thumbnailFile) {
    thumbnailSrc = URL.createObjectURL(state.thumbnailFile)
  }

  useEffect(() => {
    updateAvatar()
  }, [state.avatarFile, state.avatarUrl])

  const updateAvatar = async () => {
    let url = ''
    if (state.avatarFile && !state.formErrors.avatarFile) {
      await state.avatarFile.arrayBuffer()

      const assetType = AssetLoader.getAssetType(state.avatarFile.name)
      if (assetType) {
        url = URL.createObjectURL(state.avatarFile) + '#' + state.avatarFile.name
      }
    } else if (state.avatarUrl && !state.formErrors.avatarUrl) {
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
        tempErrors.avatarFile = inValidSize
          ? t('admin:components.avatar.avatarFileOversized', {
              minSize: MIN_AVATAR_FILE_SIZE / 1048576,
              maxSize: MAX_AVATAR_FILE_SIZE / 1048576
            })
          : ''
        if (!tempErrors.avatarFile) {
          tempState.avatarUrl = files[0].name
        }

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

        if (!tempErrors.thumbnailFile) {
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

        tempErrors.avatarUrl = error
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

        tempErrors.thumbnailUrl = error
        break
      }
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleGenerateFileThumbnail = () => {
    if (state.thumbnailFile) {
      // setShowConfirm(ConfirmState.File)
      return
    }

    handleGenerateThumbnail(true)
  }

  const handleGenerateUrlThumbnail = () => {
    if (state.thumbnailUrl) {
      // setShowConfirm(ConfirmState.Url)
      return
    }

    handleGenerateThumbnail(false)
  }

  const handleGenerateThumbnail = async (isFile: boolean) => {
    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    // const newContext = canvas.getContext('2d')
    // newContext?.drawImage(renderer.value.domElement, 0, 0)

    const blob = await getCanvasBlob(canvas)
    if (isFile) {
      setState({ ...state, thumbnailFile: new File([blob!], 'thumbnail.png') })
    } else {
      setState({ ...state, thumbnailUrl: URL.createObjectURL(blob!) })
    }

    // setShowConfirm(ConfirmState.None)
  }

  return (
    <Menu
      open
      showBackButton
      actions={
        <Box display="flex" width="100%">
          <Button
            disabled
            startIcon={<CheckIcon />}
            size="medium"
            type="gradientRounded"
            title={t('user:avatar.confirm')}
          >
            {t('user:avatar.confirm')}
          </Button>
        </Box>
      }
      title={
        t('user:avatar.createAvatar')
        // : t('user:avatar.titleEditAvatar')
      }
      onBack={() => changeActiveMenu(Views.AvatarSelect)}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent}>
        <Grid container spacing={2}>
          <Grid item md={6} sx={{ width: '100%', mt: 1 }}>
            <AvatarPreview fill avatarUrl={avatarSrc} />
          </Grid>

          <Grid item md={6} sx={{ width: '100%' }}>
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
              error={state.formErrors.avatarUrl}
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
              error={state.formErrors.thumbnailUrl}
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
              onClick={handleGenerateUrlThumbnail}
            >
              {t('admin:components.avatar.saveThumbnail')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Menu>
  )
}

export default AvatarModifyMenu
