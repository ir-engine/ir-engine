/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@etherealengine/client-core/src/common/components/Avatar'
import AvatarPreview from '@etherealengine/client-core/src/common/components/AvatarPreview'
import Button from '@etherealengine/client-core/src/common/components/Button'
import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import InputFile from '@etherealengine/client-core/src/common/components/InputFile'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
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
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { AvatarService } from '../../../services/AvatarService'
import { UserMenus } from '../../../UserUISystem'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

interface Props {
  selectedAvatar?: AvatarType
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

const AvatarModifyMenu = ({ selectedAvatar }: Props) => {
  const { t } = useTranslation()
  const [state, setState] = useState({ ...defaultState })
  const [avatarSrc, setAvatarSrc] = useState('')
  const [showConfirmThumbnail, setShowConfirmThumbnail] = useState(false)
  const [showConfirmChanges, setShowConfirmChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const avatarRef = useRef<HTMLInputElement | null>(null)
  const thumbnailRef = useRef<HTMLInputElement | null>(null)

  let thumbnailSrc = state.thumbnailUrl
  if (state.thumbnailFile) {
    thumbnailSrc = URL.createObjectURL(state.thumbnailFile)
  }

  const hasErrors = state.formErrors.name || state.formErrors.avatar || state.formErrors.thumbnail ? true : false

  let hasPendingChanges = state.name && avatarSrc && thumbnailSrc ? true : false
  if (selectedAvatar) {
    hasPendingChanges = !!(
      selectedAvatar.name !== state.name ||
      state.avatarFile ||
      state.thumbnailFile ||
      selectedAvatar.modelResource?.url !== state.avatarUrl ||
      selectedAvatar.thumbnailResource?.url !== state.thumbnailUrl
    )
  }

  useEffect(() => {
    if (selectedAvatar) {
      loadSelectedAvatar()
    }
  }, [selectedAvatar])

  useEffect(() => {
    updateAvatar()
  }, [state.avatarFile, state.avatarUrl])

  const loadSelectedAvatar = () => {
    if (selectedAvatar) {
      setState({
        ...defaultState,
        name: selectedAvatar.name || '',
        avatarUrl: selectedAvatar.modelResource?.url || '',
        thumbnailUrl: selectedAvatar.thumbnailResource?.url || '',
        avatarFile: undefined,
        thumbnailFile: undefined
      })
    }
  }

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
    setIsSaving(true)

    try {
      let avatarFile: File | undefined = undefined
      let thumbnailFile: File | undefined = undefined

      if (state.avatarFile) {
        avatarFile = state.avatarFile
      } else if (state.avatarUrl) {
        const avatarData = await fetch(state.avatarUrl)
        avatarFile = new File([await avatarData.blob()], state.avatarUrl)
      }

      if (state.thumbnailFile) {
        thumbnailFile = state.thumbnailFile
      } else if (state.thumbnailUrl) {
        const thumbnailData = await fetch(state.thumbnailUrl)
        thumbnailFile = new File([await thumbnailData.blob()], state.thumbnailUrl)
      }

      if (selectedAvatar) {
        await AvatarService.patchAvatar(
          selectedAvatar,
          state.name,
          selectedAvatar.modelResource?.url !== state.avatarUrl ||
            selectedAvatar.thumbnailResource?.url !== state.thumbnailUrl,
          avatarFile,
          thumbnailFile
        )
        PopupMenuServices.showPopupMenu(UserMenus.AvatarSelect)
      } else if (avatarFile && thumbnailFile) {
        await AvatarService.createAvatar(avatarFile, thumbnailFile, state.name, false)

        PopupMenuServices.showPopupMenu()
      }
    } catch (err) {
      console.error(err)
    }

    setIsSaving(false)
  }

  const handleBack = () => {
    if (hasPendingChanges) {
      setShowConfirmChanges(true)
    } else {
      PopupMenuServices.showPopupMenu(UserMenus.AvatarSelect)
    }
  }

  return (
    <Menu
      open
      showBackButton
      actions={
        <Box display="flex" width="100%">
          <Button
            disabled={!hasPendingChanges || hasErrors || isSaving}
            startIcon={
              isSaving ? <CircularProgress size={24} sx={{ color: 'var(--textColor)' }} /> : <Icon type="Check" />
            }
            size="medium"
            type="gradientRounded"
            title={isSaving ? t('user:common.saving') : t('user:common.save')}
            onClick={handleSave}
          >
            {isSaving ? t('user:common.saving') : t('user:common.save')}
          </Button>
        </Box>
      }
      title={selectedAvatar ? t('user:avatar.titleEditAvatar') : t('user:avatar.createAvatar')}
      onBack={handleBack}
      onClose={() => PopupMenuServices.showPopupMenu()}
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
            <Button
              fullWidth
              type="gradientRounded"
              sx={{ mt: 1 }}
              onClick={() => PopupMenuServices.showPopupMenu(UserMenus.ReadyPlayer)}
            >
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
              endIcon={state.avatarFile ? <Icon type="Clear" /> : undefined}
              endControl={
                <IconButton
                  icon={<Icon type="FileUpload" />}
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
              endIcon={state.thumbnailFile ? <Icon type="Clear" /> : undefined}
              endControl={
                <IconButton
                  icon={<Icon type="FileUpload" />}
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
              startIcon={<Icon type="Portrait" />}
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
                onSubmit={() => PopupMenuServices.showPopupMenu(UserMenus.AvatarSelect)}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </Menu>
  )
}

export default AvatarModifyMenu
