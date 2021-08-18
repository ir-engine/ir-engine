import React, { useEffect } from 'react'
import { Scene, WebGLRenderer, Color, DirectionalLight, PerspectiveCamera, HemisphereLight } from 'three'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import MapNode from '../../../../engine/src/editor/nodes/MapNode'
import MapNodeEditor from '../../../../client-core/src/world/components/editor/properties/MapNodeEditor'
import { createState, useState } from '@hookstate/core'

const globalState = createState(0)

const scene = new Scene()

class EditorMock {
  renderer: {
    renderer: WebGLRenderer
  }
  object = new MapNode(this)
  setPropertySelected(propertyName: string, value: any) {
    this.object[propertyName] = value
    this.object.onChange(propertyName)
    globalState.set((version) => version + 1)
  }
}

const editor = new EditorMock()
const mapNode = editor.object
const engineRendererCanvasId = 'engine-renderer-canvas'

const canvasStyle = {
  zIndex: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  WebkitUserSelect: 'none',
  userSelect: 'none'
} as React.CSSProperties

async function init(): Promise<any> {
  scene.background = new Color('black')

  const renderer = new WebGLRenderer({ canvas: document.getElementById(engineRendererCanvasId) as HTMLCanvasElement })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  editor.renderer = {
    renderer
  }

  scene.add(new HemisphereLight())
  scene.add(new DirectionalLight())
  scene.add(mapNode as any)

  let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.set(1, 2, 5)

  let controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 1
  controls.maxDistance = 2000
  controls.target.set(0, 0, 0)
  controls.object.position.set(0, 2000, 0)

  mapNode.onChange()

  const animate = () => {
    requestAnimationFrame(animate)

    controls.update()
    renderer.render(scene, camera)
  }
  requestAnimationFrame(animate)
}

const Page = () => {
  useEffect(() => {
    init()
  }, [])

  const state = useState(globalState)

  return (
    <>
      <p>version {state.get()}</p>
      <MapNodeEditor editor={editor} node={mapNode} />
      <canvas id={engineRendererCanvasId} style={canvasStyle} />
    </>
  )
}

export default Page
