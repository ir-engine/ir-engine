import React, { useEffect, useRef } from 'react'
import { FileDrop } from 'react-file-drop'
import {
  AnimationClip,
  AnimationMixer,
  Color,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { SkeletonUtils } from '@xrengine/engine/src/avatar/SkeletonUtils'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'

const canvasStyle = {
  zIndex: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  WebkitUserSelect: 'none',
  userSelect: 'none'
} as React.CSSProperties

const LocationPage = () => {
  return (
    <>
      <DevPage />
    </>
  )
}

export default LocationPage
let scene = new Scene()
let animationMixers = [] as AnimationMixer[]
let clips
AssetLoader.load('/default_assets/Animations.glb', (gltf) => {
  console.log(gltf)
  clips = gltf.animations
  clips.forEach((clip) => {
    clip.tracks = clip.tracks.filter((track) => !track.name.match(/^CC_Base_/))
  })
})

let model

async function init(): Promise<any> {
  scene.background = new Color('black')

  let renderer = new WebGLRenderer({ canvas: document.getElementById(engineRendererCanvasId) as HTMLCanvasElement })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  scene.add(new HemisphereLight())
  scene.add(new DirectionalLight())

  let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.set(1, 2, 5)

  let controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 1
  controls.maxDistance = 100
  controls.target.set(0, 1.25, 0)

  const animate = () => {
    requestAnimationFrame(animate)

    controls.update()
    animationMixers.forEach((mixer) => {
      mixer.update(1 / 60)
    })
    renderer.render(scene, camera)
  }
  requestAnimationFrame(animate)
}

const engineRendererCanvasId = 'engine-renderer-canvas'
let count = 0
const DevPage = () => {
  const fileInputRef = useRef<any>(null)

  useEffect(() => {
    init()
  }, [])
  const onTargetClick = () => {
    fileInputRef.current.click()
  }

  const onUploadFile = async (event) => {
    const { files } = event.target

    const fileURL = URL.createObjectURL(files[0])

    scene.remove

    AssetLoader.load(fileURL, (gltf) => {
      URL.revokeObjectURL(fileURL)

      scene.remove(model)

      const asset = gltf.scene

      model = SkeletonUtils.clone(asset)
      scene.add(model)

      const mixer = new AnimationMixer(model)
      animationMixers.push(mixer)

      const clip = AnimationClip.findByName(clips, 'run_forward')
      const action = mixer.clipAction(clip)
      action.play()
    })
  }

  return (
    <>
      <div>
        <input onChange={onUploadFile} ref={fileInputRef} type="file" className="hidden" />
        <FileDrop onTargetClick={onTargetClick}></FileDrop>
        <canvas id={engineRendererCanvasId} style={canvasStyle} />
      </div>
    </>
  )
}
