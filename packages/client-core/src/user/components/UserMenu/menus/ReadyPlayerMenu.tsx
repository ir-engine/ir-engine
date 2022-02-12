import { ArrowBack } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'
import {
  MAX_ALLOWED_TRIANGLES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@xrengine/common/src/constants/AvatarConstants'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { AuthService } from '../../../services/AuthService'
import styles from '../UserMenu.module.scss'
import { Views } from '../util'
import { validate, initializer, onWindowResize, renderScene } from './helperFunctions'
interface Props {
  changeActiveMenu: Function
  uploadAvatarModel?: Function
  isPublicAvatar?: boolean
}

export const ReadyPlayerMenu = (props: Props) => {
  const { t } = useTranslation()

  const { isPublicAvatar, changeActiveMenu } = props

  let scene: Scene = null!
  let renderer: WebGLRenderer = null!
  let maxBB = new THREE.Vector3(2, 2, 2)
  let camera: PerspectiveCamera = null!
  let controls: OrbitControls = null!

  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [error, setError] = useState('')
  const [obj, setObj] = useState<any>(null)

  useEffect(() => {
    const init = initializer()
    scene = init.scene
    camera = init.camera
    renderer = init.renderer

    controls = getOrbitControls(camera, renderer.domElement)
    ;(controls as any).addEventListener('change', renderScene) // use if there is no animation loop
    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()

    window.addEventListener('resize', () => onWindowResize({ scene, camera, renderer }))
    window.addEventListener('message', handleMessageEvent)

    return () => {
      ;(controls as any).removeEventListener('change', () => renderScene({ scene, camera, renderer }))
      window.removeEventListener('resize', () => onWindowResize({ camera, renderer, scene }))
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [])

  const handleMessageEvent = async (event) => {
    const url = event.data
    if (url != null && url.toString().toLowerCase().startsWith('http')) {
      setAvatarUrl(url)

      try {
        var avatarResult = await new Promise((resolve, reject) => {
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw Error(response.statusText)
              }
              return response
            })
            .then((response) => response.blob())
            .then((blob) => resolve(blob))
            .catch((error) => {
              reject(error)
            })
        })

        var avatarArrayBuffer = await new Response(avatarResult as any).arrayBuffer()
        const assetType = AssetLoader.getAssetType(url)
        ;(AssetLoader.getLoader(assetType) as any).parse(avatarArrayBuffer, '', (gltf) => {
          var avatarName = url.substring(url.lastIndexOf('/') + 1, url.length)
          gltf.scene.name = 'avatar'
          scene.add(gltf.scene)
          renderScene({ camera, scene, renderer })
          const error = validate(gltf.scene)
          setError(error)
          setObj(gltf.scene)
          setSelectedFile(new File([avatarResult as any], avatarName))
          uploadAvatar()
        })
      } catch (error) {
        console.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
      }
    }
  }

  const openProfileMenu = (e) => {
    e.preventDefault()
    changeActiveMenu(Views.Profile)
  }

  const closeMenu = (e) => {
    e.preventDefault()
    changeActiveMenu(null)
  }

  const uploadAvatar = () => {
    const error = validate(obj)
    if (error) {
      return
    }

    const canvas = document.createElement('canvas')
    ;(canvas.width = THUMBNAIL_WIDTH), (canvas.height = THUMBNAIL_HEIGHT)

    const newContext = canvas.getContext('2d')
    newContext?.drawImage(renderer.domElement, THUMBNAIL_WIDTH / 2 - THUMBNAIL_WIDTH, 0)

    var thumbnailName = avatarUrl.substring(0, avatarUrl.lastIndexOf('.')) + '.png'

    canvas.toBlob(async (blob) => {
      await AuthService.uploadAvatarModel(selectedFile, new File([blob!], thumbnailName), avatarName, isPublicAvatar)
      changeActiveMenu(Views.Profile)
    })
  }

  return (
    <div className={styles.ReadyPlayerPanel}>
      <div
        id="stage"
        className={styles.stage}
        style={{
          width: THUMBNAIL_WIDTH + 'px',
          height: THUMBNAIL_HEIGHT + 'px',
          position: 'absolute',
          top: '0',
          right: '100%'
        }}
      ></div>
      {avatarUrl ? (
        <iframe src={`https://${globalThis.process.env['VITE_READY_PLAYER_ME_URL']}`} />
      ) : (
        <div className={styles.centerProgress}>
          <CircularProgress />
        </div>
      )}
      <section className={styles.controlContainer}>
        <div className={styles.actionBlock}>
          <button type="button" className={styles.iconBlock} onClick={openProfileMenu}>
            <ArrowBack />
          </button>
          {/*<button type="button" className={styles.iconBlock} onClick={closeMenu}>
              <Check />
            </button>*/}
        </div>
      </section>
    </div>
  )
}

export default ReadyPlayerMenu
