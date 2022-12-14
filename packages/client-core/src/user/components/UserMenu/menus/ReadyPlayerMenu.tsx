import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import LoadingView from '@xrengine/client-core/src/common/components/LoadingView'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import { getCanvasBlob } from '@xrengine/client-core/src/common/utils'
import config from '@xrengine/common/src/config'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@xrengine/common/src/constants/AvatarConstants'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AvatarRigComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { getOptionalComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'

import { AVATAR_ID_REGEX, generateAvatarId } from '../../../../util/avatarIdFunctions'
import { AvatarService } from '../../../services/AvatarService'
import { loadAvatarForPreview, resetAnimationLogic, validate } from '../../Panel3D/helperFunctions'
import { useRender3DPanelSystem } from '../../Panel3D/useRender3DPanelSystem'
import styles from '../index.module.scss'
import { Views } from '../util'

interface Props {
  changeActiveMenu: Function
}

let scene: Scene
let camera: PerspectiveCamera
let renderer: WebGLRenderer = null!

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
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const { entity, camera, scene, renderer } = renderPanel.state

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
      setAvatarUrl(url)
      setAvatarName(avatarIdRegexExec ? avatarIdRegexExec[1] : generateAvatarId())

      try {
        const assetType = AssetLoader.getAssetType(url)
        if (assetType) {
          try {
            const res = await fetch(url)
            const data = await res.blob()

            setSelectedFile(data)
          } catch (err) {
            setError(err.message)
            console.log(err.message)
          }

          setLoading(LoadingState.LoadingPreview)

          resetAnimationLogic(entity.value)
          const obj = await loadAvatarForPreview(entity.value, url)
          if (!obj) return
          obj.name = 'avatar'
          scene.value.add(obj)

          const error = validate(obj, renderer.value, scene.value, camera.value)
          setError(error)
          renderPanel.resize()

          const avatarRigComponent = getOptionalComponent(entity.value, AvatarRigComponent)
          if (avatarRigComponent) {
            avatarRigComponent.rig.Neck.getWorldPosition(camera.value.position)
            camera.value.position.y += 0.2
            camera.value.position.z = 0.6
          }
        }
      } catch (error) {
        console.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
      }

      setLoading(LoadingState.None)
    }
  }

  const openProfileMenu = () => {
    changeActiveMenu(Views.Profile)
  }

  const uploadAvatar = async () => {
    if (error || selectedFile === undefined) {
      return
    }
    setLoading(LoadingState.Uploading)

    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(renderer.value.domElement, 0, 0)

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
      maxWidth={avatarPreviewLoaded ? 'xs' : 'sm'}
      showBackButton={avatarPreviewLoaded ? true : false}
      title={avatarPreviewLoaded ? t('user:avatar.titleSelectThumbnail') : undefined}
      onBack={openProfileMenu}
      onClose={() => changeActiveMenu(Views.Closed)}
    >
      <Box className={styles.menuContent} sx={{ minHeight: '450px !important' }}>
        {loading !== LoadingState.None && (
          <LoadingView
            sx={{ position: 'absolute', background: 'inherit', margin: -3 }}
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

        {!avatarUrl && (
          <iframe
            style={{
              position: 'absolute',
              margin: -24,
              width: '100%',
              height: '100%'
            }}
            src={config.client.readyPlayerMeUrl}
          />
        )}

        <div
          ref={panelRef}
          id="stage"
          className={styles.stage}
          style={{
            width: THUMBNAIL_WIDTH + 'px',
            height: THUMBNAIL_HEIGHT + 'px',
            margin: 'auto',
            display: avatarUrl ? 'block' : 'none',
            boxShadow: avatarPreviewLoaded ? '0 0 10px var(--buttonOutlined)' : 'none',
            borderRadius: '8px'
          }}
        ></div>

        {avatarPreviewLoaded && <IconButton icon={<CheckIcon />} onClick={uploadAvatar} />}
      </Box>
    </Menu>
  )
}

export default ReadyPlayerMenu
