import React, { useCallback, useEffect, useState } from 'react'
import { AmbientLight, Box3, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { GLTFLoader } from '@xrengine/engine/src/assets/loaders/gltf/GLTFLoader'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import styled from 'styled-components'
import { SceneManager } from '../../../managers/SceneManager'
import EditorEvents from '../../../constants/EditorEvents'
import { ProjectManager } from '../../../managers/ProjectManager'
import { CommandManager } from '../../../managers/CommandManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { FlyControlComponent } from '../../../classes/FlyControlComponent'
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

  const loadModel = () => {
    AssetLoader.load({ url }, (gltf) => {
      const result = scene.getObjectByName(gltf.scene.name)
      if (result) scene.remove(result)
      scene.add(gltf.scene)
      renderScene({ scene, camera, renderer })
    })
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
