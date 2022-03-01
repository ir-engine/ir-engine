import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { AmbientLight, Box3, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import { GLTFLoader } from '@xrengine/engine/src/assets/loaders/gltf/GLTFLoader'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'

import { FlyControlComponent } from '../../../classes/FlyControlComponent'
import { ProjectManager } from '../../../managers/ProjectManager'
import { SceneManager } from '../../../managers/SceneManager'
import { EditorAction, useEditorState } from '../../../services/EditorServices'
import { useModeState } from '../../../services/ModeServices'

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

export const ModelPreviewPanel = (props) => {
  const modeState = useModeState()
  const url = props.resourceProps.resourceUrl
  const initializeRefFly = React.useRef<boolean>(false)
  const assestPanelRef = React.createRef<HTMLCanvasElement>()

  const scene = new Scene()
  const camera = new PerspectiveCamera(75)
  // const editor = new Editor(null, { camera, scene })

  const editorState = useEditorState()

  const [flyModeEnabled, setFlyModeEnabled] = useState(false)

  const renderScene = () => {
    const canvas = assestPanelRef.current as any
    const renderer = new WebGLRenderer({
      canvas: canvas
    })

    renderer.setSize(canvas.width, canvas.height)

    const light = new AmbientLight(0x404040)
    scene.add(light)

    camera.aspect = canvas.width / canvas.width
    scene.add(camera)
    renderer.render(scene, camera)

    new GLTFLoader().load(
      url,
      (gltf) => {
        scene.add(gltf.scene)
        const bbox = new Box3().setFromObject(gltf.scene)
        bbox.getCenter(camera.position)
        camera.position.z = bbox.max.z + 1
      },
      undefined,
      () => {
        console.log('Error Loading GLTF From URl')
      }
    )
  }

  const onFlyModeChanged = useCallback(() => {
    const flyControlComponent = getComponent(SceneManager.instance.editorEntity, FlyControlComponent)
    setFlyModeEnabled(flyControlComponent.enable)
  }, [setFlyModeEnabled])

  useEffect(() => {
    if (initializeRefFly.current && editorState.rendererInitialized.value) {
      onFlyModeChanged()
      dispatchLocal(EditorAction.rendererInitialized(false))
    } else {
      initializeRefFly.current = true
    }
  }, [modeState.flyModeChanged])

  useEffect(() => {
    SceneManager.instance.initializeRenderer()
    renderScene()

    return () => {
      ProjectManager.instance.dispose()
    }
  }, [])

  return (
    <>
      <div>
        <ModelPreview ref={assestPanelRef} />
      </div>
    </>
  )
}
