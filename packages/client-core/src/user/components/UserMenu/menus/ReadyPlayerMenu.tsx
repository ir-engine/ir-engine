import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import config from '@xrengine/common/src/config'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@xrengine/common/src/constants/AvatarConstants'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { AvatarRigComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { loadAvatarForPreview } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { getOptionalComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { ArrowBack, Check } from '@mui/icons-material'

import LoadingView from '../../../../admin/common/LoadingView'
import { AVATAR_ID_REGEX, generateAvatarId } from '../../../../util/avatarIdFunctions'
import { AvatarService } from '../../../services/AvatarService'
import { resetAnimationLogic, validate } from '../../Panel3D/helperFunctions'
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
  const [hover, setHover] = useState(false)
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

  const openProfileMenu = (e) => {
    e.preventDefault()
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
    changeActiveMenu(null)
  }

  const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      })
    })
  }

  const avatarPreviewLoaded = loading === LoadingState.None && selectedFile

  return (
    <div
      className={`${styles.menuPanel} ${styles.ReadyPlayerPanel}`}
      style={{ width: avatarPreviewLoaded ? '400px' : '600px', padding: avatarPreviewLoaded ? '15px' : '0' }}
    >
      {avatarPreviewLoaded && (
        <div className={styles.avatarHeaderBlock}>
          <button
            type="button"
            className={styles.iconBlock}
            onClick={openProfileMenu}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          >
            <ArrowBack />
          </button>
          <h2>{t('user:avatar.titleSelectThumbnail')}</h2>
        </div>
      )}

      {loading !== LoadingState.None && (
        <LoadingView
          sx={{ position: 'absolute', background: 'inherit' }}
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
            position: 'relative',
            zIndex: 1,
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

      {avatarPreviewLoaded && (
        <button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          type="button"
          className={styles.iconBlock}
          style={{
            color: hover ? '#fff' : '#5f5ff1',
            marginTop: '10px',
            left: '45%',
            border: 'none',
            borderRadius: '50%',
            height: '50px',
            width: '50px',
            background: hover ? '#5f5ff1' : '#fff'
          }}
          onClick={uploadAvatar}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        >
          <Check />
        </button>
      )}
    </div>
  )
}

export default ReadyPlayerMenu
