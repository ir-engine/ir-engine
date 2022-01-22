import { ArrowBack } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'
import {
  MAX_ALLOWED_TRIANGLES,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH
} from '@xrengine/common/src/constants/AvatarConstants'
import { getLoader, loadExtensions } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { AuthService } from '../../../services/AuthService'
import styles from '../UserMenu.module.scss'
import { Views } from '../util'

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
    const container = document.getElementById('stage')!
    const bounds = container?.getBoundingClientRect()!

    camera = new THREE.PerspectiveCamera(45, bounds.width / bounds.height, 0.25, 20)
    camera.position.set(0, 1.25, 1.25)

    scene = new THREE.Scene()

    const backLight = new THREE.DirectionalLight(0xfafaff, 1)
    backLight.position.set(1, 3, -1)
    backLight.target.position.set(0, 1.5, 0)
    const frontLight = new THREE.DirectionalLight(0xfafaff, 0.7)
    frontLight.position.set(-1, 3, 1)
    frontLight.target.position.set(0, 1.5, 0)
    const hemi = new THREE.HemisphereLight(0xeeeeff, 0xebbf2c, 1)
    scene.add(backLight)
    scene.add(backLight.target)
    scene.add(frontLight)
    scene.add(frontLight.target)
    scene.add(hemi)

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(bounds.width, bounds.height)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.domElement.id = 'avatarCanvas'
    container.appendChild(renderer.domElement)

    controls = getOrbitControls(camera, renderer.domElement)
    ;(controls as any).addEventListener('change', renderScene) // use if there is no animation loop
    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()

    window.addEventListener('resize', onWindowResize)
    window.addEventListener('message', handleMessageEvent)

    return () => {
      ;(controls as any).removeEventListener('change', renderScene)
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [])

  const onWindowResize = () => {
    const container = document.getElementById('stage')
    const bounds = container?.getBoundingClientRect()!
    camera.aspect = bounds.width / bounds.height
    camera.updateProjectionMatrix()

    renderer.setSize(bounds.width, bounds.height)

    renderScene()
  }

  const renderScene = () => {
    renderer.render(scene, camera)
  }

  const handleMessageEvent = async (event) => {
    const url = event.data
    if (url != null && url.toString().toLowerCase().startsWith('http')) {
      setAvatarUrl(url)

      try {
        const loader = getLoader()

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
        loader.parse(avatarArrayBuffer, '', (gltf) => {
          var avatarName = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1, avatarUrl.length)
          gltf.scene.name = 'avatar'
          loadExtensions(gltf)
          scene.add(gltf.scene)
          renderScene()
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

  const validate = (vScene) => {
    const objBoundingBox = new THREE.Box3().setFromObject(vScene)
    if (renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
      return t('user:usermenu.avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

    if (renderer.info.render.triangles <= 0) return t('user:usermenu.avatar.emptyObj')

    const size = new THREE.Vector3().subVectors(maxBB, objBoundingBox.getSize(new THREE.Vector3()))
    if (size.x <= 0 || size.y <= 0 || size.z <= 0) return t('user:usermenu.avatar.outOfBound')

    let bone = false
    let skinnedMesh = false
    vScene.traverse((o) => {
      if (o.type.toLowerCase() === 'bone') bone = true
      if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
    })

    if (!bone || !skinnedMesh) return t('user:usermenu.avatar.noBone')

    return ''
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
