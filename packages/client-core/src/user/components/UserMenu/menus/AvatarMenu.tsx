import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@xrengine/client-core/src/common/components/Avatar'
import AvatarPreview from '@xrengine/client-core/src/common/components/AvatarPreview'
import Button from '@xrengine/client-core/src/common/components/Button'
import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import InputText from '@xrengine/client-core/src/common/components/InputText'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import Text from '@xrengine/client-core/src/common/components/Text'
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
import { AvatarEffectComponent } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { Check, KeyboardArrowDown, KeyboardArrowUp, PersonAdd } from '@mui/icons-material'
import PortraitIcon from '@mui/icons-material/Portrait'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import { useAuthState } from '../../../services/AuthService'
import { AvatarService, useAvatarService } from '../../../services/AvatarService'
import styles from '../index.module.scss'
import { Views } from '../util'

enum AvatarMenuMode {
  Select,
  Create,
  Edit
}

interface Props {
  changeActiveMenu: Function
}

const AvatarMenu = ({ changeActiveMenu }: Props) => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const userAvatarId = authState.user?.avatarId?.value

  const [viewMode, setViewMode] = useState(AvatarMenuMode.Select)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | undefined>(userAvatarId)

  const avatarState = useAvatarService()
  const { avatarList } = avatarState.value

  const selectedAvatar = avatarList.find((item) => item.id === selectedAvatarId)

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  const setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (hasComponent(Engine.instance.currentWorld.localClientEntity, AvatarEffectComponent)) return
    if (authState.user?.value) {
      AvatarService.updateUserAvatarId(authState.user.id.value!, avatarId, avatarURL, thumbnailURL)
    }
  }

  const handleBack = () => {
    if (viewMode === AvatarMenuMode.Select) {
      changeActiveMenu(Views.Profile)
    } else {
      setViewMode(AvatarMenuMode.Select)
    }
  }

  const handleConfirmAvatar = () => {
    if (selectedAvatarId && selectedAvatar && userAvatarId !== selectedAvatarId) {
      setAvatar(selectedAvatarId, selectedAvatar.modelResource?.url || '', selectedAvatar.thumbnailResource?.url || '')
      changeActiveMenu(Views.Closed)
    }
    setSelectedAvatarId(undefined)
  }

  return (
    <Menu
      open
      showBackButton
      actions={
        <Box display="flex" width="100%">
          <Button
            disabled={!selectedAvatar || selectedAvatar.id === userAvatarId}
            startIcon={<Check />}
            size="medium"
            type="gradientRounded"
            title={t('user:avatar.confirm')}
            onClick={handleConfirmAvatar}
          >
            {t('user:avatar.confirm')}
          </Button>
        </Box>
      }
      title={
        viewMode === AvatarMenuMode.Select
          ? t('user:avatar.titleSelectAvatar')
          : viewMode === AvatarMenuMode.Create
          ? t('user:avatar.createAvatar')
          : t('user:avatar.titleEditAvatar')
      }
      onBack={handleBack}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent}>
        <Grid container spacing={2}>
          <Grid item md={6} sx={{ width: '100%' }}>
            <AvatarPreview fill selectedAvatar={selectedAvatar} />
          </Grid>

          <Grid item md={6} sx={{ width: '100%' }}>
            {viewMode === AvatarMenuMode.Select && (
              <AvatarSelectView
                changeActiveMenu={changeActiveMenu}
                selectedAvatar={selectedAvatar}
                setSelectedAvatarId={setSelectedAvatarId}
                setViewMode={setViewMode}
              />
            )}

            {viewMode === AvatarMenuMode.Create && (
              <AvatarCreateView
                changeActiveMenu={changeActiveMenu}
                selectedAvatar={selectedAvatar}
                setSelectedAvatarId={setSelectedAvatarId}
                setViewMode={setViewMode}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </Menu>
  )
}

interface AvatarViewProps {
  changeActiveMenu: Function
  selectedAvatar?: AvatarInterface
  setSelectedAvatarId: (avatarId: string | undefined) => void
  setViewMode: (mode: AvatarMenuMode) => void
}

const AvatarSelectView = ({ selectedAvatar, setSelectedAvatarId, setViewMode }: AvatarViewProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const avatarState = useAvatarService()
  const { avatarList, search } = avatarState.value

  const handleNextAvatars = (e) => {
    e.preventDefault()

    setPage(page + 1)
    AvatarService.fetchAvatarList(search, 'increment')
  }

  const handlePreviousAvatars = (e) => {
    e.preventDefault()

    setPage(page - 1)
    AvatarService.fetchAvatarList(search, 'decrement')
  }

  const handleEditAvatar = (avatar: AvatarInterface) => {
    setSelectedAvatarId(avatar.id)
    setViewMode(AvatarMenuMode.Edit)
  }

  const handleCreateAvatar = () => {
    setSelectedAvatarId(undefined)
    setViewMode(AvatarMenuMode.Create)
  }

  return (
    <>
      <InputText
        placeholder={t('user:avatar.searchAvatar')}
        value={search}
        sx={{ pt: '5px' }}
        onChange={(e) => AvatarService.fetchAvatarList(e.target.value)}
      />

      <IconButton icon={<KeyboardArrowUp />} sx={{ display: 'none' }} onClick={handlePreviousAvatars} />

      <Grid container sx={{ height: '275px', gap: 1.5, overflow: 'auto' }}>
        {avatarList.map((avatar) => (
          <Grid item key={avatar.id} md={12} sx={{ pt: 0, width: '100%' }}>
            <Avatar
              imageSrc={avatar.thumbnailResource?.url || ''}
              isSelected={selectedAvatar && avatar.id === selectedAvatar.id}
              name={avatar.name}
              showChangeButton
              type="rectangle"
              onClick={() => setSelectedAvatarId(avatar.id)}
              onChange={() => handleEditAvatar(avatar)}
            />
          </Grid>
        ))}

        {avatarList.length === 0 && (
          <Text align="center" margin={'32px auto'} variant="body2">
            {t('user:avatar.noAvatars')}
          </Text>
        )}
      </Grid>

      <IconButton icon={<KeyboardArrowDown />} sx={{ display: 'none' }} onClick={handleNextAvatars} />

      <Button
        fullWidth
        startIcon={<PersonAdd />}
        title={t('user:avatar.createAvatar')}
        type="gradientRounded"
        sx={{ mb: 0 }}
        onClick={handleCreateAvatar}
      >
        {t('user:avatar.createAvatar')}
      </Button>
    </>
  )
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

const AvatarCreateView = ({ changeActiveMenu }: AvatarViewProps) => {
  const { t } = useTranslation()
  const [state, setState] = useState({ ...defaultState })

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
    <>
      <Button fullWidth type="gradientRounded" sx={{ mt: 0 }} onClick={() => changeActiveMenu(Views.ReadyPlayer)}>
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
        label={t('admin:components.avatar.avatarUrl')}
        value={state.avatarUrl}
        error={state.formErrors.avatarUrl}
        sx={{ mt: 2 }}
        onChange={handleChange}
      />

      <InputText
        name="thumbnailUrl"
        label={t('admin:components.avatar.thumbnailUrl')}
        value={state.thumbnailUrl}
        error={state.formErrors.thumbnailUrl}
        sx={{ mt: 2, mb: 1 }}
        onChange={handleChange}
      />

      <Avatar
        // imageSrc={thumbnailSrc}
        type="thumbnail"
        size={100}
        sx={{ margin: '20px auto' }}
      />

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
    </>
  )
}

export default AvatarMenu
