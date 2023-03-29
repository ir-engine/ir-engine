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
import Box from '@etherealengine/ui/src/Box'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

import { AVATAR_ID_REGEX, generateAvatarId } from '../../../../util/avatarIdFunctions'
import { AvatarService } from '../../../services/AvatarService'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

enum LoadingState {
  None,
  LoadingRPM,
  Downloading,
  LoadingPreview,
  Uploading
}

const ReadyPlayerMenu = ({ changeActiveMenu }: Props) => {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<Blob>()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(LoadingState.LoadingRPM)
  const [error, setError] = useState('')

  useEffect(() => {
    window.addEventListener('message', handleMessageEvent)
    return () => {
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [avatarUrl])

  const handleMessageEvent = async (event) => {
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
          setSelectedFile(data)
        }
      } catch (error) {
        console.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
        setLoading(LoadingState.None)
      }
    }
  }

  const handleNameChange = (e) => {
    const { value } = e.target

    setError(value.length < 2 ? t('admin:components.avatar.nameRequired') : '')
    setAvatarName(value)
  }

  const uploadAvatar = async () => {
    if (error || selectedFile === undefined) {
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

    const blob = await getCanvasBlob(canvas)

    await AvatarService.createAvatar(selectedFile, new File([blob!], thumbnailName), avatarName, false)

    setLoading(LoadingState.None)
    changeActiveMenu(Views.Closed)
  }

  const avatarPreviewLoaded = loading === LoadingState.None && selectedFile

  return (
    <Menu
      open
      maxWidth={loading === LoadingState.LoadingRPM ? 'sm' : 'xs'}
      showBackButton={avatarPreviewLoaded ? true : false}
      title={avatarPreviewLoaded ? t('user:avatar.titleSelectThumbnail') : undefined}
      onBack={() => changeActiveMenu(Views.Profile)}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box
        className={styles.menuContent}
        sx={{ minHeight: loading === LoadingState.LoadingRPM ? '450px !important' : '370px !important' }}
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
                : t('user:avatar.loadingRPM')
            }
          />
        )}

        {loading === LoadingState.LoadingRPM && (
          <iframe
            style={{
              position: 'absolute',
              margin: -24,
              width: '100%',
              height: '100%',
              zIndex: 2
            }}
            src={config.client.readyPlayerMeUrl}
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

        {loading !== LoadingState.LoadingRPM && (
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

export default ReadyPlayerMenu
