import type { WebLayer3D } from '@etherealjs/web-layer/three'
import { DoubleSide, Mesh, MeshBasicMaterial, SphereGeometry, Texture } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent, setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { setVisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { textureLoader } from '@xrengine/engine/src/scene/constants/Util'
import { setObjectLayers } from '@xrengine/engine/src/scene/functions/setObjectLayers'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createTransitionState } from '@xrengine/engine/src/xrui/functions/createTransitionState'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { getState } from '@xrengine/hyperflux'

import { accessSceneState } from '../world/services/SceneService'
import { LoadingSystemState } from './state/LoadingState'
import { createLoaderDetailView } from './ui/LoadingDetailView'

export default async function LoadingUISystem(world: World) {
  const transitionPeriodSeconds = 1
  const transition = createTransitionState(transitionPeriodSeconds, 'IN')

  const sceneState = accessSceneState()
  const thumbnailUrl = sceneState.currentScene.ornull?.thumbnailUrl.value.replace('thumbnail.jpeg', 'envmap.png')!

  const ui = createLoaderDetailView(transition)

  addComponent(ui.entity, NameComponent, { name: 'Loading XRUI' })

  const mesh = new Mesh(
    new SphereGeometry(10),
    new MeshBasicMaterial({ side: DoubleSide, transparent: true, depthWrite: true, depthTest: false })
  )
  mesh.visible = false
  textureLoader.load(thumbnailUrl, (texture) => {
    if (texture) mesh.material.map = texture!
    mesh.visible = true
  })

  // flip inside out
  mesh.scale.set(-1, 1, 1)
  mesh.renderOrder = 1
  Engine.instance.currentWorld.camera.add(mesh)

  setObjectLayers(mesh, ObjectLayers.UI)

  const execute = () => {
    if (transition.state === 'OUT' && transition.alpha === 0) return

    mesh.quaternion.copy(Engine.instance.currentWorld.camera.quaternion).invert()

    // add a slow rotation to animate on desktop, otherwise just keep it static for VR
    // if (!getEngineState().joinedWorld.value) {
    //   Engine.instance.currentWorld.camera.rotateY(world.delta * 0.35)
    // } else {
    //   // todo: figure out how to make this work properly for VR
    // }

    const xrui = getComponent(ui.entity, XRUIComponent)

    const distance = 0.1
    const ppu = xrui.container.options.manager.pixelsPerMeter
    const contentWidth = ui.state.imageWidth.value / ppu
    const contentHeight = ui.state.imageHeight.value / ppu

    const loadingState = getState(LoadingSystemState).loadingScreenOpacity

    const scale = ObjectFitFunctions.computeContentFitScaleForCamera(distance, contentWidth, contentHeight, 'cover')
    ObjectFitFunctions.attachObjectInFrontOfCamera(xrui.container, scale, distance)
    transition.update(world.deltaSeconds, (opacity) => {
      if (opacity !== loadingState.value) loadingState.set(opacity)
      mesh.material.opacity = opacity
      mesh.visible = opacity > 0
      xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
        const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
        mat.opacity = opacity
        mat.visible = opacity > 0
        layer.visible = opacity > 0
      })
      if (opacity < 0.001) setVisibleComponent(ui.entity, false)
    })
  }

  const cleanup = async () => {
    removeEntity(ui.entity)
    mesh.removeFromParent()
  }

  return { execute, cleanup }
}
