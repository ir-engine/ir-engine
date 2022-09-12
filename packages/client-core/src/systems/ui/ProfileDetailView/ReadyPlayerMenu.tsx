import { createState } from '@hookstate/core'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@xrengine/common/src/constants/AvatarConstants'
import multiLogger from '@xrengine/common/src/logger'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { loadAvatarForPreview } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppService } from '@xrengine/engine/src/xrui/WidgetAppService'
import { WidgetName } from '@xrengine/engine/src/xrui/Widgets'

import { ArrowBack, Check } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'

import {
  addAnimationLogic,
  initialize3D,
  onWindowResize,
  validate
} from '../../../user/components/UserMenu/menus/helperFunctions'
import { AvatarService } from '../../../user/services/AvatarService'
import styleString from './index.scss'

const logger = multiLogger.child({ component: 'client-core:ReadyPlayerMenu' })

export function createReadyPlayerMenu() {
  return createXRUI(ReadyPlayerMenu, createReadyPlayerMenuState())
}

function createReadyPlayerMenuState() {
  return createState({})
}

let scene: Scene
let camera: PerspectiveCamera
let renderer: WebGLRenderer = null!

const ReadyPlayerMenu = () => {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<Blob>()
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [hover, setHover] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [error, setError] = useState('')
  const [obj, setObj] = useState<any>(null)
  const [entity, setEntity] = useState<Entity | undefined>()
  const panelRef = useRef() as React.MutableRefObject<HTMLDivElement>

  useEffect(() => {
    if (document.getElementById('stage')) {
      const world = useWorld()
      const entity = createEntity()
      setEntity(entity)
      addAnimationLogic(entity, world, panelRef)
      const init = initialize3D()
      scene = init.scene
      camera = init.camera
      renderer = init.renderer
      const controls = getOrbitControls(camera, renderer.domElement)
      controls.minDistance = 0.1
      controls.maxDistance = 10
      controls.target.set(0, 1.25, 0)
      controls.update()

      window.addEventListener('resize', () => onWindowResize({ scene, camera, renderer }))
      window.addEventListener('message', (event) => handleMessageEvent(event, entity))

      return () => {
        window.removeEventListener('resize', () => onWindowResize({ camera, renderer, scene }))
        window.removeEventListener('message', (event) => handleMessageEvent(event, entity))
      }
    }
  }, [avatarUrl, document.getElementById('stage')])

  const handleMessageEvent = async (event, entity) => {
    const url = event.data

    if (url && url.toString().toLowerCase().startsWith('http')) {
      setShowLoading(true)
      setAvatarUrl(url)
      try {
        const assetType = AssetLoader.getAssetType(url)
        if (assetType) {
          loadAvatarForPreview(entity, url).then((obj) => {
            obj.name = 'avatar'
            scene.add(obj)
            const error = validate(obj)
            setError(error)
            setObj(obj)
          })
          fetch(url)
            .then((res) => res.blob())
            .then((data) => setSelectedFile(data))
            .catch((err) => {
              setError(err.message)
              logger.error(err)
            })
            .finally(() => setShowLoading(false))
        }
      } catch (error) {
        logger.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
      }
    } else {
      setShowLoading(false)
    }
  }

  const openProfileMenu = (e) => {
    WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, true)
  }

  const closeMenu = (e) => {
    WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, false)
    uploadAvatar()
  }

  const uploadAvatar = () => {
    if (error || selectedFile === undefined) {
      return
    }

    const canvas = document.createElement('canvas')
    ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(renderer.domElement, 0, 0)

    var thumbnailName = avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.png'

    canvas.toBlob(async (blob) => {
      await AvatarService.createAvatar(selectedFile, new File([blob!], thumbnailName), avatarName, false)
      WidgetAppService.setWidgetVisibility(WidgetName.PROFILE, true)
    })
  }

  return (
    <>
      <style>{styleString}</style>
      <div
        ref={panelRef}
        className="ReadyPlayerPanel"
        style={{ width: selectedFile ? '400px' : '600px', padding: selectedFile ? '15px' : '0' }}
      >
        {selectedFile && (
          <section className="controlContainer">
            <div className="actionBlock">
              <button
                type="button"
                className="iconBlock"
                style={{
                  borderRadius: '50%',
                  height: '40px',
                  width: '40px',
                  background: 'transparent'
                }}
                xr-layer="true"
                onClick={openProfileMenu}
              >
                <ArrowBack />
              </button>
            </div>
          </section>
        )}
        {!avatarUrl && (
          <iframe
            style={{ width: '100%', height: '100%' }}
            src={`${globalThis.process.env['VITE_READY_PLAYER_ME_URL']}`}
          />
        )}
        <div
          id="stage"
          className="stage"
          style={{
            width: THUMBNAIL_WIDTH + 'px',
            height: THUMBNAIL_HEIGHT + 'px',
            margin: 'auto',
            display: !avatarUrl ? 'none' : 'block',
            boxShadow: !avatarUrl || showLoading ? 'none' : '0 0 10px var(--buttonOutlined)',
            borderRadius: '8px'
          }}
        ></div>
        {selectedFile && (
          <button
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            type="button"
            className="iconBlock"
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
            xr-layer="true"
            onClick={closeMenu}
          >
            <Check />
          </button>
        )}
        {showLoading && <CircularProgress style={{ position: 'absolute', top: '50%', left: '46%' }} />}
      </div>
    </>
  )
}

export default ReadyPlayerMenu
