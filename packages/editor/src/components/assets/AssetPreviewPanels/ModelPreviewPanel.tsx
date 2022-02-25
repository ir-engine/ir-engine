import React, { useEffect } from 'react'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { loadAvatarModelAsset } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import styled from 'styled-components'
import {
  initialize3D,
  onWindowResize,
  renderScene
} from '@xrengine/client-core/src/user/components/UserMenu/menus/helperFunctions'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
/**
 * @author Abhishek Pathak
 */

const ModelPreview = (styled as any).canvas`
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  height: 100%;
  position: relative;
`

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 * @param props
 * @returns
 */

let camera: PerspectiveCamera
let scene: Scene
let renderer: WebGLRenderer = null!

export const ModelPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl

  const loadModel = async () => {
    const model = await loadAvatarModelAsset(url)
    model.name = 'avatar'
    const result = scene.getObjectByName(model.name)
    if (result) scene.remove(result)
    scene.add(model)
    renderScene({ scene, camera, renderer })
  }

  if (renderer) loadModel()

  useEffect(() => {
    const init = initialize3D()
    scene = init.scene
    camera = init.camera
    renderer = init.renderer
    const controls = getOrbitControls(camera, renderer.domElement)
    ;(controls as any).addEventListener('change', () => renderScene({ scene, camera, renderer }))

    controls.minDistance = 0.1
    controls.maxDistance = 10
    controls.target.set(0, 1.25, 0)
    controls.update()
    loadModel()

    window.addEventListener('resize', () => onWindowResize({ scene, camera, renderer }))

    return () => {
      window.removeEventListener('resize', () => onWindowResize({ scene, camera, renderer }))
    }
  }, [])

  return (
    <>
      <div id="stage" style={{ width: '300px', height: '200px', margin: 'auto' }}></div>
    </>
  )
}
