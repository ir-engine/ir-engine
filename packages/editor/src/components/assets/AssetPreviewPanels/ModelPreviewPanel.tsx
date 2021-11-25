import React, { useCallback, useEffect, useState } from 'react'
import { AmbientLight, Box3, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { GLTFLoader } from '@xrengine/engine/src/assets/loaders/gltf/GLTFLoader'
import styled from 'styled-components'
import { SceneManager } from '../../../managers/SceneManager'
import EditorEvents from '../../../constants/EditorEvents'
import { ProjectManager } from '../../../managers/ProjectManager'
import { CommandManager } from '../../../managers/CommandManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { FlyControlComponent } from '../../../classes/FlyControlComponent'

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
  const url = props.resourceProps.resourceUrl
  const assestPanelRef = React.createRef<HTMLCanvasElement>()

  const scene = new Scene()
  const camera = new PerspectiveCamera(75)
  // const editor = new Editor(null, { camera, scene })

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

  const onEditorInitialized = useCallback(() => {
    CommandManager.instance.addListener(EditorEvents.FLY_MODE_CHANGED.toString(), onFlyModeChanged)
    CommandManager.instance.removeListener(EditorEvents.RENDERER_INITIALIZED.toString(), onEditorInitialized)
  }, [onFlyModeChanged])

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.RENDERER_INITIALIZED.toString(), onEditorInitialized)
    SceneManager.instance.initializeRenderer(assestPanelRef.current)
    renderScene()

    return () => {
      CommandManager.instance.removeListener(EditorEvents.FLY_MODE_CHANGED.toString(), onFlyModeChanged)
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
