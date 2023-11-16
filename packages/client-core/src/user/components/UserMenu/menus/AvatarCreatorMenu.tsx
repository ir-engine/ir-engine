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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AvatarPreview from '@etherealengine/client-core/src/common/components/AvatarPreview'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { getCanvasBlob } from '@etherealengine/client-core/src/common/utils'
import config from '@etherealengine/common/src/config'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@etherealengine/common/src/constants/AvatarConstants'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { AVATAR_ID_REGEX, generateAvatarId } from '../../../../util/avatarIdFunctions'
import { SupportedSdks, UserMenus } from '../../../UserUISystem'
import { AvatarService } from '../../../services/AvatarService'
import { PopupMenuServices } from '../PopupMenuService'
import styles from '../index.module.scss'

enum LoadingState {
  None,
  LoadingCreator,
  Downloading,
  LoadingPreview,
  Uploading
}

interface Props {
  selectedSdk?: string
}

const AvatarCreatorMenu = ({ selectedSdk }: Props) => {
  const { t } = useTranslation()
  const [selectedBlob, setSelectedBlob] = useState<Blob>()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(LoadingState.LoadingCreator)
  const [error, setError] = useState('')

  useEffect(() => {
    window.addEventListener('message', handleMessageEvent)
    return () => {
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [avatarUrl])

  const getSdkUrl = (selectedsdk) => {
    switch (selectedSdk) {
      case SupportedSdks.Avaturn:
        return config.client.avaturnUrl
      case SupportedSdks.ReadyPlayerMe:
      default:
        return config.client.readyPlayerMeUrl
    }
  }

  const handleReadyPlayerMeMessageEvent = async (event) => {
    const url = event.data
    const avatarIdRegexExec = AVATAR_ID_REGEX.exec(url)

    if (url && url.toString().toLowerCase().startsWith('http')) {
      setLoading(LoadingState.Downloading)
      setError('')
      setAvatarName(avatarIdRegexExec ? avatarIdRegexExec[1] : generateAvatarId())

      try {
        const assetType = AssetLoader.getAssetType(url)
        if (assetType) {
          const res = await fetch(url)
          const data = await res.blob()

          setLoading(LoadingState.LoadingPreview)
          setAvatarUrl(url)
          setSelectedBlob(data)
        }
      } catch (error) {
        console.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
        setLoading(LoadingState.None)
      }
    }
  }

  const handleAvaturnMessageEvent = async (event) => {
    const response = event.data

    let json
    try {
      json = JSON.parse(response)
    } catch (error) {
      console.log('Error parsing the event data.')
      return
    }

    if (json.source !== 'avaturn') return // always check the source its always 'avaturn'

    // Get avatar GLB URL
    if (json.eventName === 'v2.avatar.exported') {
      const url = json.data.url
      console.log('DEBUG url', url)
      const avatarIdRegexExec = AVATAR_ID_REGEX.exec(url)
      if (url && url.toString().toLowerCase().startsWith('http')) {
        setLoading(LoadingState.Downloading)
        setError('')
        setAvatarName(avatarIdRegexExec ? avatarIdRegexExec[1] : generateAvatarId())

        try {
          const res = await fetch(response)
          const data = await res.blob()
          setLoading(LoadingState.LoadingPreview)
          setAvatarUrl(url)
          setSelectedBlob(data)
        } catch (error) {
          console.error(error)
          setError(t('user:usermenu.avatar.selectValidFile'))
          setLoading(LoadingState.None)
        }
      }
    }
  }

  const handleMessageEvent = async (event) => {
    switch (selectedSdk) {
      case SupportedSdks.Avaturn:
        handleAvaturnMessageEvent(event)
        break
      case SupportedSdks.ReadyPlayerMe:
      default:
        handleReadyPlayerMeMessageEvent(event)
    }
  }

  const handleNameChange = (e) => {
    const { value } = e.target

    setError(value.length < 2 ? t('admin:components.avatar.nameRequired') : '')
    setAvatarName(value)
  }

  const uploadAvatar = async () => {
    if (error || selectedBlob === undefined) {
      return
    }
    setLoading(LoadingState.Uploading)

    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    const avatarCanvas = document.getElementById('stage')?.firstChild as CanvasImageSource

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(avatarCanvas, 0, 0)

    const thumbnailName = avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.png'
    const modelName = avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.glb'

    const blob = await getCanvasBlob(canvas)

    await AvatarService.createAvatar(
      new File([selectedBlob!], modelName),
      new File([blob!], thumbnailName),
      avatarName,
      false
    )

    setLoading(LoadingState.None)
    PopupMenuServices.showPopupMenu()
  }

  const avatarPreviewLoaded = loading === LoadingState.None && selectedBlob

  return (
    <Menu
      open
      maxWidth={loading === LoadingState.LoadingCreator ? 'sm' : 'xs'}
      showBackButton={avatarPreviewLoaded ? true : false}
      title={avatarPreviewLoaded ? t('user:avatar.titleSelectThumbnail') : undefined}
      onBack={() => PopupMenuServices.showPopupMenu(UserMenus.Profile)}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box
        className={styles.menuContent}
        sx={{ minHeight: loading === LoadingState.LoadingCreator ? '450px !important' : '370px !important' }}
      >
        {loading !== LoadingState.None && (
          <LoadingView
            sx={{ position: 'absolute', background: 'var(--popupBackground)', margin: -3, zIndex: 1 }}
            variant="body2"
            title={
              loading === LoadingState.Downloading
                ? t('user:avatar.downloading')
                : loading === LoadingState.LoadingPreview
                ? t('user:avatar.loadingPreview')
                : loading === LoadingState.Uploading
                ? t('user:avatar.uploading')
                : t(`user:avatar.loading${selectedSdk}`)
            }
          />
        )}

        {loading === LoadingState.LoadingCreator && (
          <iframe
            style={{
              position: 'absolute',
              margin: -24,
              width: '100%',
              height: '100%',
              zIndex: 2,
              maxWidth: '100%',
              border: 0
            }}
            src={getSdkUrl(selectedSdk)}
          />
        )}

        {avatarPreviewLoaded && (
          <InputText
            name="name"
            label={t('user:avatar.avatarName')}
            value={avatarName}
            error={error}
            sx={{ width: `${THUMBNAIL_WIDTH}px`, m: 'auto', p: '10px 0' }}
            onChange={handleNameChange}
          />
        )}

        {loading !== LoadingState.LoadingCreator && (
          <Box padding="10px 0">
            <AvatarPreview
              avatarUrl={avatarUrl}
              sx={{ width: `${THUMBNAIL_WIDTH}px`, height: `${THUMBNAIL_HEIGHT}px`, m: 'auto' }}
              onAvatarError={(error) => setError(error)}
              onAvatarLoaded={() => setLoading(LoadingState.None)}
            />
          </Box>
        )}

        {avatarPreviewLoaded && (
          <Box display="flex" justifyContent="center" width="100%" margin="10px 0">
            <IconButton icon={<Icon type="Check" />} type="gradient" onClick={uploadAvatar} />
          </Box>
        )}
      </Box>
    </Menu>
  )
}

export default AvatarCreatorMenu
