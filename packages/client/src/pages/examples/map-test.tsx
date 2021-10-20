import React, { useEffect } from 'react'
import { Scene, WebGLRenderer, Color, DirectionalLight, Camera, PerspectiveCamera, HemisphereLight } from 'three'
import { OrbitControls } from '@xrengine/engine/src/input/functions/OrbitControls'
import MapNode from '@xrengine/editor/src/nodes/MapNode'
import MapNodeEditor from '@xrengine/editor/src/components/properties/MapNodeEditor'
import { createState, DevTools, useState } from '@hookstate/core'

const scene = new Scene()

const LOCAL_STORAGE_KEY = 'xrengine:map-test:editor:object'

class EditorMock {
  camera: Camera
  renderer: {
    renderer: WebGLRenderer
  }
  object = new MapNode(this)
  async load() {
    const json = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (json) {
      this.object = (await MapNode.deserialize(this, JSON.parse(json))) as MapNode
      globalState.set(this.object)
    }
  }
  async save() {
    const serialized = await this.object.serialize('test')
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serialized))
  }
  setPropertySelected(propertyName: string, value: any) {
    if (this.object) {
      this.object[propertyName] = value
      this.object.onChange(propertyName)
      globalState.set(this.object.clone(false))
      this.save()
    }
  }
}

const editor = new EditorMock()
editor.load()

const globalState = createState(editor.object)

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
  scene.add(editor.object as any)

  editor.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
  editor.camera.position.set(1, 2, 5)

  let controls = new OrbitControls(editor.camera, renderer.domElement)
  controls.minDistance = 1
  controls.maxDistance = 2000
  controls.target.set(0, 0, 0)
  controls.object.position.set(0, 2000, 0)

  editor.object.onChange()

  const animate = (time: number) => {
    requestAnimationFrame(animate)

    controls.update()

    editor.object.onUpdate(time)
    renderer.render(scene, editor.camera)
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
      <p style={{ color: 'black' }}>JSON: {JSON.stringify(state.value.getProps())}</p>
      <MapNodeEditor editor={editor} node={editor.object} />
      <canvas id={engineRendererCanvasId} style={canvasStyle} />
    </>
  )
}

export default Page
