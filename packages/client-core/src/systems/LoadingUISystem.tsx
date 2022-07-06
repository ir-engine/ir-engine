import type { WebLayer3D } from '@etherealjs/web-layer/three'
import { DoubleSide, Mesh, MeshBasicMaterial, SphereGeometry, Texture } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { textureLoader } from '@xrengine/engine/src/scene/constants/Util'
import { setObjectLayers } from '@xrengine/engine/src/scene/functions/setObjectLayers'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createTransitionState } from '@xrengine/engine/src/xrui/functions/createTransitionState'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'

import { accessSceneState } from '../world/services/SceneService'
import { LoadingSystemState } from './state/LoadingState'
import { createLoaderDetailView } from './ui/LoadingDetailView'

export default async function LoadingUISystem(world: World) {
  const transitionPeriodSeconds = 1
  const transition = createTransitionState(transitionPeriodSeconds)

  // todo: push timeout to accumulator
  matchActionOnce(EngineActions.joinedWorld.matches, () => {
    setTimeout(() => {
      mesh.visible = false
      transition.setState('OUT')
    }, 250)
  })

  const sceneState = accessSceneState()
  const thumbnailUrl = sceneState.currentScene.ornull?.thumbnailUrl.value.replace('thumbnail.jpeg', 'envmap.png')!

  const [ui, texture] = await Promise.all([
    createLoaderDetailView(),
    new Promise<Texture | null>((resolve) => textureLoader.load(thumbnailUrl, resolve, null!, () => resolve(null)))
  ])

  addComponent(ui.entity, PersistTagComponent, {})

  const mesh = new Mesh(
    new SphereGeometry(10),
    new MeshBasicMaterial({ side: DoubleSide, transparent: true, depthWrite: true, depthTest: false })
  )
  if (texture) mesh.material.map = texture!
  // flip inside out
  mesh.scale.set(-1, 1, 1)
  mesh.renderOrder = 1
  Engine.instance.currentWorld.camera.add(mesh)

  setObjectLayers(mesh, ObjectLayers.UI)

  return () => {
    mesh.quaternion.copy(Engine.instance.currentWorld.camera.quaternion).invert()

    // add a slow rotation to animate on desktop, otherwise just keep it static for VR
    // if (!getEngineState().joinedWorld.value) {
    //   Engine.instance.currentWorld.camera.rotateY(world.delta * 0.35)
    // } else {
    //   // todo: figure out how to make this work properly for VR
    // }

    const xrui = getComponent(ui.entity, XRUIComponent)

    if (xrui) {
      const distance = 0.1
      const ppu = xrui.container.options.manager.pixelsPerMeter
      const contentWidth = ui.state.imageWidth.value / ppu
      const contentHeight = ui.state.imageHeight.value / ppu

      const scale = ObjectFitFunctions.computeContentFitScaleForCamera(distance, contentWidth, contentHeight, 'cover')
      ObjectFitFunctions.attachObjectInFrontOfCamera(xrui.container, scale, distance)

      transition.update(world, (opacity) => {
        if (opacity !== 1 - LoadingSystemState.opacity.value) LoadingSystemState.opacity.set(1 - opacity)
        mesh.material.opacity = opacity
        mesh.visible = opacity > 0
        xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
          const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
          mat.opacity = opacity
          mat.visible = opacity > 0
          layer.visible = opacity > 0
        })
      })
    }
  }
}
