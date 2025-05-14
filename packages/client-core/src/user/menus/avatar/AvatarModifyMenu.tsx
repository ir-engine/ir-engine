/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AvatarPreview from '@ir-engine/client-core/src/common/components/AvatarPreview'
import { getCanvasBlob, isValidHttpUrl } from '@ir-engine/client-core/src/common/utils'
import {
  AVATAR_FILE_ALLOWED_EXTENSIONS,
  MAX_AVATAR_FILE_SIZE,
  MAX_THUMBNAIL_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  MIN_THUMBNAIL_FILE_SIZE,
  THUMBNAIL_FILE_ALLOWED_EXTENSIONS,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@ir-engine/common/src/constants/AvatarConstants'
import { AvatarType } from '@ir-engine/common/src/schema.type.module'
import { AssetLoader } from '@ir-engine/engine/src/assets/classes/AssetLoader'

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { Button, Input } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import { Upload01Lg, User01Lg, XCloseLg } from '@ir-engine/ui/src/icons'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import { ModalState } from '../../../common/services/ModalState'
import { AvatarService } from '../../services/AvatarService'
import AvatarCreatorMenu2, { SupportedSdks } from './AvatarCreatorMenu'
import AvatarSelectMenu from './AvatarSelectMenu'

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
  const [isSaving, setIsSaving] = useState(false)
  const avatarRef = useRef<HTMLInputElement | null>(null)
  const thumbnailRef = useRef<HTMLInputElement | null>(null)

  const [avaturnEnabled, rpmEnabled] = useFeatureFlags([
    FeatureFlags.Client.Menu.Avaturn,
    FeatureFlags.Client.Menu.ReadyPlayerMe
  ])

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
      ModalState.openModal(
        <ConfirmDialog
          text={t('admin:components.avatar.confirmThumbnailReplace')}
          onSubmit={handleProcessGenerateThumbnail}
        />
      )
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
    newContext?.drawImage(avatarCanvas, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)

    const blob = await getCanvasBlob(canvas)
    setState({ ...state, thumbnailUrl: 'thumbnail.png', thumbnailFile: new File([blob!], 'thumbnail.png') })
    ModalState.closeModal()
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
        ModalState.openModal(<AvatarSelectMenu showBackButton={true} previewEnabled={true} />)
      } else if (avatarFile && thumbnailFile) {
        await AvatarService.createAvatar(avatarFile, thumbnailFile, state.name, false)
        ModalState.closeModal()
      }
    } catch (err) {
      console.error(err)
    }

    setIsSaving(false)
  }

  return (
    <Modal
      submitButtonText={t('user:common.save')}
      onSubmit={handleSave}
      submitLoading={isSaving}
      title={selectedAvatar ? t('user:avatar.titleEditAvatar') : t('user:avatar.createAvatar')}
      onClose={() => ModalState.closeModal()}
      className="pointer-events-auto w-[50vw] min-w-[720px] max-w-2xl"
    >
      <div className="grid grid-cols-2 gap-x-4">
        <div className="col-span-1">
          <AvatarPreview avatarUrl={avatarSrc} />
        </div>
        <div className="col-span-1 grid grid-cols-1 gap-y-3">
          {rpmEnabled && (
            <Button
              fullWidth
              onClick={() => {
                const Menu = AvatarCreatorMenu2(SupportedSdks.ReadyPlayerMe)
                ModalState.openModal(<Menu showBackButton={false} previewEnabled={true} />)
              }}
            >
              {t('user:usermenu.profile.useReadyPlayerMe')}
            </Button>
          )}

          {avaturnEnabled && (
            <Button
              fullWidth
              onClick={() => {
                const Menu = AvatarCreatorMenu2(SupportedSdks.Avaturn)
                ModalState.openModal(<Menu showBackButton={false} previewEnabled={true} />)
              }}
            >
              {t('user:usermenu.profile.useAvaturn')}
            </Button>
          )}

          <Input
            labelProps={{
              text: t('user:avatar.name'),
              position: 'top'
            }}
            value={state.name}
            state={state.formErrors.name ? 'error' : undefined}
            helperText={state.formErrors.name}
            onChange={handleChange}
            fullWidth
          />

          <Input
            labelProps={{
              text: t('user:avatar.avatar'),
              position: 'top'
            }}
            placeholder={t('user:avatar.enterAvatarUrl')}
            value={state.avatarUrl}
            state={state.formErrors.avatar ? 'error' : undefined}
            helperText={state.formErrors.avatar}
            endComponent={
              <div className="flex h-4 justify-start gap-x-1">
                {state.avatarFile ? (
                  <button
                    className="h-4 w-4"
                    onClick={() => {
                      setState({ ...state, avatarUrl: '', avatarFile: undefined })
                      if (avatarRef.current) {
                        avatarRef.current.value = ''
                      }
                    }}
                  >
                    <XCloseLg />
                  </button>
                ) : null}
                <input
                  ref={avatarRef}
                  name="avatarFile"
                  accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
                  onChange={handleChangeFile}
                  type="file"
                  id="avatarInput"
                  className="hidden"
                />
                <label htmlFor="avatarInput" className="flex cursor-pointer items-center justify-center">
                  <Upload01Lg />
                </label>
              </div>
            }
            fullWidth
          />

          <Input
            labelProps={{
              text: t('user:avatar.thumbnail'),
              position: 'top'
            }}
            placeholder={t('user:avatar.enterThumbnailUrl')}
            value={state.thumbnailUrl}
            state={state.formErrors.thumbnail ? 'error' : undefined}
            helperText={state.formErrors.thumbnail}
            endComponent={
              <div className="flex h-4 justify-start gap-x-1">
                {state.thumbnailFile ? (
                  <button
                    className="h-4 w-4"
                    onClick={() => {
                      setState({ ...state, thumbnailUrl: '', thumbnailFile: undefined })
                      if (thumbnailRef.current) {
                        thumbnailRef.current.value = ''
                      }
                    }}
                  >
                    <XCloseLg />
                  </button>
                ) : null}

                <input
                  type="file"
                  id="avatarThumbnailInput"
                  className="hidden"
                  ref={thumbnailRef}
                  name="thumbnailFile"
                  accept={THUMBNAIL_FILE_ALLOWED_EXTENSIONS}
                  onChange={handleChangeFile}
                />
                <label htmlFor="avatarThumbnailInput" className="flex cursor-pointer items-center justify-center">
                  <Upload01Lg />
                </label>
              </div>
            }
            fullWidth
          />

          {thumbnailSrc && (
            <div className="flex w-full items-center justify-center">
              <img src={thumbnailSrc} className="h-24 w-24 rounded object-cover" />
            </div>
          )}

          <Button disabled={!state.avatarUrl} fullWidth onClick={handleGenerateThumbnail}>
            <User01Lg />
            {t('admin:components.avatar.saveThumbnail')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AvatarModifyMenu
