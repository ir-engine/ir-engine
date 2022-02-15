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
import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimationMixer, Object3D, PerspectiveCamera, Scene, WebGLRenderer, Vector3 } from 'three'
import { AuthService } from '../../../services/AuthService'
import styles from '../UserMenu.module.scss'
import { Views } from '../util'
import { validate, initializer, onWindowResize, renderScene } from './helperFunctions'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { loadAvatarForPreview } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
interface Props {
  changeActiveMenu: Function
}

export const ReadyPlayerMenu = (props: Props) => {
  const { t } = useTranslation()

  let scene: Scene = null!
  let renderer: WebGLRenderer = null!
  // let maxBB = Vector3(2, 2, 2)
  let camera: PerspectiveCamera = null!
  let controls: OrbitControls = null!

  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [avatarName, setAvatarName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [error, setError] = useState('')
  const [obj, setObj] = useState<any>(null)
  const [entity, setEntity] = useState<any>(null)
  const panelRef = useRef<any>()

  useEffect(() => {
    const world = useWorld()
    const entity = createEntity()
    addComponent(entity, AnimationComponent, {
      // empty object3d as the mixer gets replaced when model is loaded
      mixer: new AnimationMixer(new Object3D()),
      animations: [],
      animationSpeed: 1
    })
    addComponent(entity, LoopAnimationComponent, {
      activeClipIndex: 0,
      hasAvatarAnimations: true,
      action: null!
    })
    setEntity(entity)

    async function AvatarSelectRenderSystem(world: World) {
      return () => {
        // only render if this menu is open
        if (!!panelRef.current) {
          renderer.render(scene, camera)
        }
      }
    }

    initSystems(world, [
      {
        type: SystemUpdateType.POST_RENDER,
        systemModulePromise: Promise.resolve({ default: AvatarSelectRenderSystem })
      }
    ])
    const init = initializer()
    scene = init.scene
    camera = init.camera
    renderer = init.renderer

    controls = getOrbitControls(camera, renderer.domElement)
    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()

    window.addEventListener('resize', () => onWindowResize({ scene, camera, renderer }))
    window.addEventListener('message', handleMessageEvent)

    return () => {
      window.removeEventListener('resize', () => onWindowResize({ camera, renderer, scene }))
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [])

  const handleMessageEvent = async (event) => {
    const url = event.data
    if (url != null && url.toString().toLowerCase().startsWith('http')) {
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
        }
      } catch (error) {
        console.error(error)
        setError(t('user:usermenu.avatar.selectValidFile'))
      }
    }
  }

  const openProfileMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(Views.Profile)
  }

  const closeMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(null)
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
      await AuthService.uploadAvatarModel(selectedFile, new File([blob!], thumbnailName), avatarName, false)
      props.changeActiveMenu(Views.Profile)
    })
  }

  return (
    <div ref={panelRef} className={styles.ReadyPlayerPanel}>
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
        <iframe src={`${globalThis.process.env['VITE_READY_PLAYER_ME_URL']}`} />
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
