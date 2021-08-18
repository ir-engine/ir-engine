import React, { useEffect, useRef } from 'react'
import { Scene, WebGLRenderer, Color, DirectionalLight, PerspectiveCamera, HemisphereLight, Vector3 } from 'three'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import { create } from '@xrengine/engine/src/map'

let scene = new Scene()

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
  controls.maxDistance = 2000
  controls.target.set(0, 0, 0)
  controls.object.position.set(0, 2000, 0)

  const map = await create(renderer, {
    scale: new Vector3(1, 1, 1)
  })

  scene.add(map.mapMesh)

  const animate = () => {
    requestAnimationFrame(animate)

    controls.update()
    renderer.render(scene, camera)
  }
  requestAnimationFrame(animate)
}

const engineRendererCanvasId = 'engine-renderer-canvas'

const canvasStyle = {
  zIndex: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  WebkitUserSelect: 'none',
  userSelect: 'none'
} as React.CSSProperties

const Page = () => {
  useEffect(() => {
    init()
  }, [])
  return (
    <>
      <div>
        <canvas id={engineRendererCanvasId} style={canvasStyle} />
      </div>
    </>
  )
}

export default Page
