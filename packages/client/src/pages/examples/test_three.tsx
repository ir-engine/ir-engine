import React, { useEffect, useState } from 'react'
import {
  Scene,
  WebGLRenderer,
  Color,
  Mesh,
  BoxBufferGeometry,
  MeshStandardMaterial,
  Vector3,
  PerspectiveCamera,
  AmbientLight
} from 'three'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import TrailRenderer from '@xrengine/engine/src/scene/classes/TrailRenderer'

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

const engineRendererCanvasId = 'engine-renderer-canvas'
let count = 0
const DevPage = () => {
  useEffect(() => {
    init()
  }, [])

  async function init(): Promise<any> {
    const scene = new Scene()
    scene.background = new Color('grey')

    const renderer = new WebGLRenderer({ canvas: document.getElementById(engineRendererCanvasId) as HTMLCanvasElement })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(20, 15, 10)
    camera.lookAt(0, 0, 0)

    const trailTarget = new Mesh(new BoxBufferGeometry(), new MeshStandardMaterial({ color: new Color('#fff') }))
    scene.add(trailTarget)
    scene.add(new AmbientLight(0xaaaaaa))

    const trailHeadGeometry = []
    trailHeadGeometry.push(new Vector3(-1.0, 0.0, 0.0), new Vector3(0.0, 0.0, 0.0), new Vector3(1.0, 0.0, 0.0))
    const trail = new TrailRenderer(false)
    const trailMaterial = TrailRenderer.createBaseMaterial()
    const trailLength = 150

    trail.initialize(trailMaterial, trailLength, false, 0, trailHeadGeometry, trailTarget)
    scene.add(trail)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    controls.update()

    let lastTrailUpdateTime = 0
    const animate = () => {
      requestAnimationFrame(animate)

      const time = Date.now()
      if (time - lastTrailUpdateTime > 10) {
        trail.advance()
        lastTrailUpdateTime = time
      } else {
        trail.updateHead()
      }

      var scaledTime = time * 0.001
      var areaScale = 10
      count += 0.02
      trailTarget.position.x = Math.sin(scaledTime) * areaScale
      trailTarget.position.y = Math.sin(scaledTime * 1.1) * areaScale
      trailTarget.position.z = Math.sin(scaledTime * 1.6) * areaScale

      renderer.render(scene, camera)
    }
    requestAnimationFrame(animate)
  }

  return (
    <>
      <div>
        <canvas id={engineRendererCanvasId} style={canvasStyle} />
      </div>
    </>
  )
}
